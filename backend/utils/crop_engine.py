import os
import json

_HERE = os.path.dirname(__file__)
_CROPS_FILE = os.path.join(_HERE, "..", "data", "nepal_crops.json")


def load_crops():
    
    # "encoding='utf-8'" keeps special characters safe. "r" means read-only.
    with open(_CROPS_FILE, "r", encoding="utf-8") as f:
        return json.load(f) 


def range_score(value, low, high, points):
    
    # If we have no value to compare, we cannot score it.
    if value is None:
        return 0

    # Perfect fit: the value sits inside the crop's ideal range.
    if low <= value <= high:
        return points

    # Otherwise, measure how far outside the range we are.
    if value < low:
        distance = low - value
    else:
        distance = value - high

    
    tolerance = max(high - low, 1)

    fraction = 1 - (distance / tolerance)
    if fraction < 0:
        fraction = 0
    return round(points * fraction)


def soil_score(soil_type, crop_soils, points):
    
    if not soil_type:
        return 0

    # Make everything lower-case for a fair comparison.
    wanted = soil_type.strip().lower()
    good_soils = [s.lower() for s in crop_soils]

    return points if wanted in good_soils else 0


def season_matches(season, crop_seasons):
    """Return True if the given season is one of the crop's growing seasons."""
    if not season:
        return False
    wanted = season.strip().lower()
    return wanted in [s.lower() for s in crop_seasons]


def score_crop(crop, temperature, rainfall, soil_type, ph, season):
    """Score ONE crop out of 100 (plus a 10-point season bonus, capped at 100)."""

    score = 0

    # Four equal parts, 25 points each = 100 total.
    score += range_score(temperature, crop["temperature"]["min"], crop["temperature"]["max"], 25)
    score += range_score(rainfall, crop["rainfall"]["min"], crop["rainfall"]["max"], 25)
    score += soil_score(soil_type, crop["soil"], 25)
    score += range_score(ph, crop["ph"]["min"], crop["ph"]["max"], 25)

    # Optional bonus: if the season matches, add 10 points.
    if season_matches(season, crop["season"]):
        score += 10

    # Never let the score go above 100.
    if score > 100:
        score = 100

    return score


def recommend_crop(temperature, humidity, rainfall, soil_type, ph, season=None):
   
    crops = load_crops()   # load the database fresh each call (easy to edit)

    # Build a list of { "crop": name, "score": number } for every crop.
    results = []
    for crop in crops:
        score = score_crop(crop, temperature, rainfall, soil_type, ph, season)
        results.append({"crop": crop["name"], "score": score})

    # Sort from highest score to lowest.
    results.sort(key=lambda item: item["score"], reverse=True)

    # Keep only the top five.
    top_crops = results[:5]

    # The single best crop is simply the first one in the sorted list.
    best = top_crops[0] if top_crops else {"crop": None, "score": 0}

    # Return the result in the shape the API/frontend expects.
    return {
        "recommended_crop": best["crop"],
        "score": best["score"],
        "top_crops": top_crops,
    }
