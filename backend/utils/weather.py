import requests            # "requests" lets Python make HTTP calls to other websites
from config import API_KEY  # our OpenWeather key, loaded from the .env file

# The address of the OpenWeather "current weather" endpoint.
OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def get_weather(latitude, longitude):
    
    parameters = {
        "lat": latitude,
        "lon": longitude,
        "appid": API_KEY,
        "units": "metric",
    }

    # Make the actual GET request. "timeout=10" means give up after 10 seconds
    # so our server never hangs forever waiting for a reply.
    response = requests.get(OPENWEATHER_URL, params=parameters, timeout=10)

    # If OpenWeather returned an error status (like 401 wrong key, or 404),
    # this line raises an exception, which app.py will catch and turn into a 500.
    response.raise_for_status()

    # Turn the JSON text OpenWeather sent back into a Python dictionary.
    data = response.json()

    # OpenWeather returns a BIG dictionary. We pick out only the useful parts.
    # "data['main']['temp']" reads temp from inside the "main" section, etc.
    result = {
        "city": data["name"],                        # e.g. "Bhubaneswar"
        "temperature": data["main"]["temp"],         # in Celsius
        "humidity": data["main"]["humidity"],        # in %
        "pressure": data["main"]["pressure"],        # in hPa
        "wind_speed": data["wind"]["speed"],         # in m/s
        "description": data["weather"][0]["description"],  # e.g. "clear sky"
    }

    # Return the small, clean dictionary instead of the full OpenWeather JSON.
    return result
