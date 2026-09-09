import requests
from datetime import datetime, date
from config import API_KEY   # same key as weather, loaded from .env

# The address of the OpenWeather forecast endpoint.
FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


def get_forecast(latitude, longitude):
    """Return a simple 3-day forecast list for the given coordinate."""

    # Ask for Celsius with units=metric, same as the weather call.
    parameters = {
        "lat": latitude,
        "lon": longitude,
        "appid": API_KEY,
        "units": "metric",
    }

    response = requests.get(FORECAST_URL, params=parameters, timeout=10)
    response.raise_for_status()
    data = response.json()

    # STEP 1: group every 3-hour slot by its calendar date.
    # Each slot looks like: { "dt_txt": "2026-07-01 12:00:00",
    #                         "main": {"temp": 24.1}, "pop": 0.3, ... }
    # "pop" = probability of precipitation, a number from 0 to 1.
    days = {}  # e.g. { "2026-07-01": {"temps": [...], "pops": [...]} }
    for slot in data["list"]:
        day_text = slot["dt_txt"].split(" ")[0]   # keep only "2026-07-01"
        bucket = days.setdefault(day_text, {"temps": [], "pops": []})
        bucket["temps"].append(slot["main"]["temp"])
        bucket["pops"].append(slot.get("pop", 0))

    # STEP 2: turn the first 3 days into our simple summary list.
    forecast = []
    today = date.today()
    for day_text in sorted(days.keys())[:3]:      # first 3 dates, in order
        bucket = days[day_text]

        # Friendly label: Today / Tomorrow / weekday name (e.g. "Friday").
        this_day = datetime.strptime(day_text, "%Y-%m-%d").date()
        days_away = (this_day - today).days
        if days_away == 0:
            label = "Today"
        elif days_away == 1:
            label = "Tomorrow"
        else:
            label = this_day.strftime("%A")       # full weekday name

        # One temperature = average of the day's slots (rounded).
        average_temp = round(sum(bucket["temps"]) / len(bucket["temps"]))

        # One rain % = the highest chance of rain that day (0..1 -> 0..100).
        rain_chance = round(max(bucket["pops"]) * 100)

        forecast.append({"day": label, "temp": average_temp, "rain": rain_chance})

    return forecast
