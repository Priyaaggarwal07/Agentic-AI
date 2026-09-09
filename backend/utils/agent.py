from datetime import datetime
from concurrent.futures import ThreadPoolExecutor

from dotenv import load_dotenv
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langgraph.prebuilt import create_react_agent

# Our own domain functions (the ones we built earlier).
from utils.weather import get_weather
from utils.soil import get_soil
from utils.crop_engine import recommend_crop
from utils.forecast import get_forecast

load_dotenv()


def _current_season():
    """Work out the Nepali growing season from today's month."""
    month = datetime.now().month
    if 6 <= month <= 9:
        return "Monsoon"
    if month in (10, 11):
        return "Autumn"
    if month == 12 or month <= 2:
        return "Winter"
    return "Spring"


def _monthly_rainfall(season):
    return {"Monsoon": 250, "Autumn": 70, "Winter": 40, "Spring": 90}.get(season, 100)


def fetch_weather_and_soil(latitude, longitude):

    # A ThreadPoolExecutor runs each function in its own thread.
    with ThreadPoolExecutor(max_workers=2) as executor:
        weather_future = executor.submit(get_weather, latitude, longitude)
        soil_future = executor.submit(get_soil, latitude, longitude)

        # .result() waits for that thread to finish and gives us the value.
        weather = weather_future.result()
        soil = soil_future.result()

    return weather, soil


# ---- Tools the LLM can call ---- #

@tool
def weather_lookup(latitude: float, longitude: float) -> dict:
    """Get the CURRENT weather (temperature in C, humidity %, wind, and the city
    name) for a latitude/longitude in Nepal."""
    return get_weather(latitude, longitude)


@tool
def soil_lookup(latitude: float, longitude: float) -> dict:
    """Get SOIL information (soil type/texture, pH, and Nitrogen/Phosphorus/
    Potassium levels) for a latitude/longitude in Nepal."""
    return get_soil(latitude, longitude)


@tool
def forecast_lookup(latitude: float, longitude: float) -> list:
    """Get the 3-day weather FORECAST (day, temperature in C, and rain chance %)
    for a latitude/longitude in Nepal."""
    return get_forecast(latitude, longitude)


@tool
def crop_recommendation(latitude: float, longitude: float) -> dict:
    """Recommend the best crops to grow at a latitude/longitude in Nepal.
    Gathers weather + soil for that point and returns the top crops with a
    suitability score out of 100."""
    # Fetch weather + soil in parallel (two threads) before scoring crops.
    weather, soil = fetch_weather_and_soil(latitude, longitude)
    season = _current_season()
    return recommend_crop(
        temperature=weather["temperature"],
        humidity=weather["humidity"],
        rainfall=_monthly_rainfall(season),
        soil_type=soil["type"],
        ph=soil["ph"],
        season=season,
    )


@tool
def fertilizer_lookup(latitude: float, longitude: float, crop: str) -> dict:
    """Get the recommended fertilizer amounts (DAP, Urea, MOP in kg/ropani) for
    a specific crop at a latitude/longitude in Nepal."""
    soil = get_soil(latitude, longitude)
    table = soil.get("fertilizer_data") or {}
    # Case-insensitive match so "rice" finds the key "Rice".
    for name, amounts in table.items():
        if name.lower() == crop.lower():
            return {"crop": name, "fertilizer": amounts}
    return {"message": f"No specific fertilizer data available for '{crop}' at this location."}


# ---- Build the agent --------------------------------------------------------

# The LLM that does the reasoning. gpt-4o-mini is cheap and capable enough here.
# temperature=0 makes answers more consistent. All agents share the same LLM.
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)


# =============================================================================
# MULTI-AGENT SETUP
#
# Instead of one agent holding every tool, we have:
#   * three SPECIALIST agents, each an expert with only its own tools, and
#   * one PLANNER agent that reads the question, delegates the parts to the
#     right specialists, and combines their answers.
#
# We connect them with the "agent-as-tool" pattern: each specialist is wrapped
# in a @tool, and the planner's tools ARE the specialists. So when the planner
# "calls a tool", it is really asking a specialist agent a sub-question.
# =============================================================================

# ---- Specialist 1: Weather (current weather + forecast) ----
weather_agent = create_react_agent(
    llm,
    tools=[weather_lookup, forecast_lookup],
    prompt=(
        "You are a WEATHER specialist for Nepal. Use your tools to report "
        "current weather or the 3-day forecast. Cite the actual numbers."
    ),
)

# ---- Specialist 2: Soil ----
soil_agent = create_react_agent(
    llm,
    tools=[soil_lookup],
    prompt=(
        "You are a SOIL specialist for Nepal. Use your tool to report soil "
        "type, pH, and nutrient (N/P/K) levels. Cite the actual numbers."
    ),
)

# ---- Specialist 3: Crop + Fertilizer ----
crop_agent = create_react_agent(
    llm,
    tools=[crop_recommendation, fertilizer_lookup],
    prompt=(
        "You are a CROP and FERTILIZER specialist for Nepal. Use your tools to "
        "recommend crops for a location and give fertilizer amounts for a crop."
    ),
)


# ---- Wrap each specialist as a tool the planner can call --------------------
# Each takes a natural-language sub-question that MUST include the latitude and
# longitude, runs that specialist, and returns its answer as text.

def _run_specialist(agent, question):
    """Run a specialist agent on a sub-question and return its final text."""
    result = agent.invoke({"messages": [{"role": "user", "content": question}]})
    return result["messages"][-1].content


@tool
def ask_weather_specialist(question: str) -> str:
    """Delegate a weather or forecast question to the weather specialist.
    Include the latitude and longitude in the question."""
    return _run_specialist(weather_agent, question)


@tool
def ask_soil_specialist(question: str) -> str:
    """Delegate a soil question (soil type, pH, nutrients) to the soil
    specialist. Include the latitude and longitude in the question."""
    return _run_specialist(soil_agent, question)


@tool
def ask_crop_specialist(question: str) -> str:
    """Delegate a crop-choice or fertilizer question to the crop specialist.
    Include the latitude and longitude in the question."""
    return _run_specialist(crop_agent, question)


# ---- The Planner (coordinator) agent ----------------------------------------
PLANNER_PROMPT = (
    "You are the PLANNER for an agricultural assistant for farmers in Nepal. "
    "You do not answer questions yourself — you delegate to specialists:\n"
    "  * ask_weather_specialist — current weather and the 3-day forecast\n"
    "  * ask_soil_specialist — soil type, pH, and nutrients\n"
    "  * ask_crop_specialist — what crops to grow, and fertilizer amounts\n"
    "Break the user's question into parts and call the right specialist(s). "
    "ALWAYS pass the latitude and longitude along in each sub-question. "
    "If no location was given, ask the user for it. "
    "Finally, combine the specialists' answers into one short, friendly reply "
    "that cites the actual numbers."
)

planner = create_react_agent(
    llm,
    tools=[ask_weather_specialist, ask_soil_specialist, ask_crop_specialist],
    prompt=PLANNER_PROMPT,
)


def ask_agent(question, latitude=None, longitude=None, history=None):
    """
    Entry point. Runs the PLANNER agent with the current session history, then
    delegates to the weather / soil / crop specialists and combines answers.
    """
    # Give the planner the clicked coordinate so it can pass it to specialists.
    if latitude is not None and longitude is not None:
        question = (
            f"{question}\n\n"
            f"(The user's selected location is latitude={latitude}, longitude={longitude}.)"
        )

    messages = list(history or [])
    messages.append({"role": "user", "content": question})

    result = planner.invoke({"messages": messages})

    # Log which SPECIALISTS the planner delegated to (its "tools").
    delegated = []
    for message in result["messages"]:
        for call in getattr(message, "tool_calls", None) or []:
            delegated.append(call["name"])
    if delegated:
        print(f"[planner] delegated to: {', '.join(delegated)}")
    else:
        print("[planner] answered directly (no delegation)")

    return result["messages"][-1].content
