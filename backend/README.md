# 🌦️ Weather Intelligence API (FastAPI Backend)

A tiny, beginner-friendly FastAPI backend for the AI Weather Intelligence
project. It has just two endpoints and no database.

```
GET  /         -> { "message": "Weather Intelligence API Running" }
POST /weather  -> returns temperature, humidity, pressure, wind, description, city
```

---

## 1. Install Python

Make sure you have **Python 3.12+**:

```bash
python --version
```

## 2. Create a virtual environment

A virtual environment keeps this project's packages separate from other
projects on your computer.

```bash
# from inside the backend/ folder
python -m venv venv
```

Activate it:

```bash
# Windows (PowerShell)
venv\Scripts\Activate.ps1

# macOS / Linux
source venv/bin/activate
```

You should now see `(venv)` at the start of your terminal line.

## 3. Install the requirements

```bash
pip install -r requirements.txt
```

## 4. Add your API key

Open the `.env` file and paste your free OpenWeather key after the `=`:

```
OPENWEATHER_API_KEY=your_key_here
```

Get a key at <https://home.openweathermap.org/api_keys>
(new keys can take a little while to activate).

## 5. Run the server

```bash
uvicorn app:app --reload
```

- `app:app` means "in the file **app**.py, use the variable **app**".
- `--reload` restarts the server automatically when you edit the code.

The server runs at <http://localhost:8000>.

## 6. Test with Swagger (built-in)

FastAPI gives you a free interactive test page. Open:

```
http://localhost:8000/docs
```

Click **POST /weather** → **Try it out**, enter:

```json
{ "latitude": 20.2961, "longitude": 85.8245 }
```

Click **Execute** and read the response.

## 7. Test with Postman

1. Method: **POST**
2. URL: `http://localhost:8000/weather`
3. Body → **raw** → **JSON**:
   ```json
   { "latitude": 20.2961, "longitude": 85.8245 }
   ```
4. Click **Send**.

Expected response:

```json
{
  "city": "Bhubaneswar",
  "temperature": 31,
  "humidity": 82,
  "pressure": 1008,
  "wind_speed": 5,
  "description": "clear sky"
}
```

---

## Files at a glance

| File               | Why it exists                                             |
|--------------------|-----------------------------------------------------------|
| `app.py`           | Creates the app and defines the endpoints                 |
| `config.py`        | Loads the API key from `.env` in one place                |
| `utils/weather.py` | The single function that calls OpenWeather                |
| `.env`             | Stores the secret API key (never commit this to GitHub)   |
| `requirements.txt` | The list of packages to install                           |
