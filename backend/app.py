from typing import Optional
from uuid import uuid4

from fastapi import FastAPI, HTTPException        
from fastapi.middleware.cors import CORSMiddleware  
from pydantic import BaseModel                   

from utils.weather import get_weather             
from utils.soil import get_soil                   
from utils.forecast import get_forecast           
from utils.crop_engine import recommend_crop      

app = FastAPI(title="Weather Intelligence API")

chat_sessions = {}


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_methods=["*"],
    allow_headers=["*"],
)


class Coordinates(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class CropInput(BaseModel):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    rainfall: Optional[float] = None
    soil_type: Optional[str] = None
    ph: Optional[float] = None
    season: Optional[str] = None


class AskInput(BaseModel):
    question: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    session_id: Optional[str] = None


class ChatSessionResponse(BaseModel):
    session_id: str


@app.get("/")
def read_root():
    return {"message": "Weather Intelligence API Running"}


@app.post("/weather")
def weather_endpoint(coords: Coordinates):

    if coords.latitude is None or coords.longitude is None:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")

    try:
        weather_data = get_weather(coords.latitude, coords.longitude)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch weather data")

    return weather_data


@app.post("/soil")
def soil_endpoint(coords: Coordinates):

    # STEP 1: validate the input, same as weather.
    if coords.latitude is None or coords.longitude is None:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")

    # STEP 2: call the Nepal soil API through our helper, catching any failure.
    try:
        soil_data = get_soil(coords.latitude, coords.longitude)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch soil data")

    # STEP 3: send the soil dictionary back to the frontend as JSON.
    return soil_data


@app.post("/forecast")
def forecast_endpoint(coords: Coordinates):

    # STEP 1: validate the input.
    if coords.latitude is None or coords.longitude is None:
        raise HTTPException(status_code=400, detail="latitude and longitude are required")

    # STEP 2: call OpenWeather's forecast through our helper.
    try:
        forecast_data = get_forecast(coords.latitude, coords.longitude)
    except Exception:
        raise HTTPException(status_code=500, detail="Could not fetch forecast data")

    # STEP 3: send the forecast list back to the frontend as JSON.
    return forecast_data


@app.post("/crop-suitability")
def crop_suitability_endpoint(data: CropInput):

    # STEP 1: basic validation. The four scored values are required.
    if (
        data.temperature is None
        or data.rainfall is None
        or data.soil_type is None
        or data.ph is None
    ):
        raise HTTPException(
            status_code=400,
            detail="temperature, rainfall, soil_type and ph are required",
        )

    # STEP 2: run the rule-based engine. It does all the scoring for us.
    try:
        result = recommend_crop(
            temperature=data.temperature,
            humidity=data.humidity,
            rainfall=data.rainfall,
            soil_type=data.soil_type,
            ph=data.ph,
            season=data.season,   # optional; may be None
        )
    except Exception:
        raise HTTPException(status_code=500, detail="Could not compute crop suitability")

    # STEP 3: send the recommendation back to the frontend as JSON.
    return result


@app.post("/chat-sessions", response_model=ChatSessionResponse)
def create_chat_session():
    session_id = str(uuid4())
    chat_sessions[session_id] = []
    return {"session_id": session_id}


@app.delete("/chat-sessions/{session_id}")
def delete_chat_session(session_id: str):
    chat_sessions.pop(session_id, None)
    return {"message": "Chat session deleted"}


@app.post("/ask")
def ask_endpoint(data: AskInput):

    # STEP 1: validate the input.
    if not data.question:
        raise HTTPException(status_code=400, detail="question is required")
    if not data.session_id:
        raise HTTPException(status_code=400, detail="session_id is required")
    if data.session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="chat session not found")

    # STEP 2: run the agent. We import it here (not at the top) so the rest of
    # the API still works even before you install the LangGraph/OpenAI packages.
    try:
        from utils.agent import ask_agent
        history = chat_sessions[data.session_id]
        answer = ask_agent(data.question, data.latitude, data.longitude, history)
        history.extend([
            {"role": "user", "content": data.question},
            {"role": "assistant", "content": answer},
        ])
    except Exception as e:
        print(f"Agent error: {e}")  # log the error for debugging
        # Include the error text so it's easy to debug while learning.
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")

    # STEP 3: send the agent's answer back to the frontend as JSON.
    return {"answer": answer}
