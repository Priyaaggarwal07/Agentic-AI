import re
import requests

# The address of the Nepal soil API.
NEPAL_SOIL_URL = "https://soil.narc.gov.np/soil/api/soildata"


# ---- Small text helpers -----------------------------------------------------

def _strip_html(raw):
    """Remove <span ...> tags and return the plain text inside."""
    if raw is None:
        return None
    # re.sub replaces anything that looks like <...> with an empty string.
    return re.sub(r"<[^>]+>", "", str(raw)).strip()


def _extract_number(text):
    """Pull the first number out of a string like '7.68  (Low Alkaline)' -> 7.68."""
    if not text:
        return None
    match = re.search(r"[-+]?\d*\.?\d+", text)   # finds e.g. 7.68 or 199.38
    return float(match.group()) if match else None


def _extract_rating(text):
    """Pull the word inside brackets: '0.08 % (Medium)' -> 'Medium'."""
    if not text:
        return None
    match = re.search(r"\(([^)]+)\)", text)      # finds text inside ( ... )
    return match.group(1).strip() if match else None


def _classify_texture(sand, silt, clay):
    
    if sand is None or silt is None or clay is None:
        return None

    if (silt + 1.5 * clay) < 15:
        return "Sand"
    if (silt + 1.5 * clay) >= 15 and (silt + 2 * clay) < 30:
        return "Loamy Sand"
    if (7 <= clay < 20 and sand > 52 and (silt + 2 * clay) >= 30) or (clay < 7 and silt < 50 and (silt + 2 * clay) >= 30):
        return "Sandy Loam"
    if 7 <= clay < 27 and 28 <= silt < 50 and sand <= 52:
        return "Loam"
    if (50 <= silt < 80 and clay < 27) or (silt >= 80 and clay < 12):
        return "Silt Loam" if silt < 80 else "Silt"
    if 20 <= clay < 35 and silt < 28 and sand > 45:
        return "Sandy Clay Loam"
    if 27 <= clay < 40 and 20 < sand <= 45:
        return "Clay Loam"
    if 27 <= clay < 40 and sand <= 20:
        return "Silty Clay Loam"
    if clay >= 35 and sand > 45:
        return "Sandy Clay"
    if clay >= 40 and silt >= 40:
        return "Silty Clay"
    if clay >= 40 and sand <= 45 and silt < 40:
        return "Clay"
    return "Loam"   # safe fallback for anything in between


def _simplify_texture(usda_texture):
    
    families = {
        "Sand": "Sandy",
        "Loamy Sand": "Sandy",
        "Sandy Loam": "Sandy Loam",
        "Sandy Clay Loam": "Sandy Loam",
        "Loam": "Loam",
        "Silt": "Loam",
        "Silt Loam": "Loam",
        "Clay Loam": "Clay Loam",
        "Silty Clay Loam": "Clay Loam",
        "Clay": "Clay",
        "Silty Clay": "Clay",
        "Sandy Clay": "Clay",
    }
    return families.get(usda_texture)   # None if we couldn't classify


def _to_float(value):
    
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _summarise_fertilizer(fertilizer_data):
    
    if not isinstance(fertilizer_data, dict):
        return {}

    summary = {}
    for crop_name, varieties in fertilizer_data.items():
        # Skip anything that isn't the expected { variety: { nutrients } } shape.
        if not isinstance(varieties, dict) or not varieties:
            continue

        # Prefer the open-pollinated variety (OPV); otherwise take the first one.
        variety = varieties.get("OPV") or next(iter(varieties.values()))

        # Add the three Urea top-dressings together into one total.
        urea_total = 0.0
        for key in ("UREA1", "UREA2", "UREA3"):
            amount = _to_float(variety.get(key))
            if amount:
                urea_total += amount

        summary[crop_name] = {
            "dap": _to_float(variety.get("DAP")),
            "urea": round(urea_total, 2) if urea_total else None,
            "mop": _to_float(variety.get("MOP")),
            "organic": _to_float(variety.get("organic")),
            "zinc": _to_float(variety.get("zinc")),
            "boron": _to_float(variety.get("boron")),
        }

    return summary


# ---- Main function ----------------------------------------------------------

def get_soil(latitude, longitude):
    """
    Ask the Nepal soil API for soil data at a point and return a small, clean
    dictionary in the shape our frontend expects.
    """

    # Values we send in the URL query string: ?lat=..&lon=..
    parameters = {"lat": latitude, "lon": longitude}

    # Make the GET request. timeout=30 so our server never hangs forever.
    response = requests.get(NEPAL_SOIL_URL, params=parameters, timeout=30)

    # If the API returned an error status, raise -> app.py turns it into a 500.
    response.raise_for_status()

    # Turn the JSON text into a Python dictionary.
    data = response.json()

    # Clean the three HTML-wrapped fields once so we can reuse them below.
    ph_text = _strip_html(data.get("ph"))
    nitrogen_text = _strip_html(data.get("total_nitrogen"))
    phosphorus_text = _strip_html(data.get("p2o5"))
    potassium_text = _strip_html(data.get("potassium"))

    # Work out the soil TEXTURE from the sand/silt/clay percentages, then
    # simplify it to a family name our crop engine understands (Loam, Clay, ...).
    sand_pct = _extract_number(_strip_html(data.get("sand")))
    silt_pct = _extract_number(_strip_html(data.get("slit")))   # API key is "slit"
    clay_pct = _extract_number(_strip_html(data.get("clay")))
    usda_texture = _classify_texture(sand_pct, silt_pct, clay_pct)  # e.g. "Silt Loam"
    soil_family = _simplify_texture(usda_texture)                   # e.g. "Loam"

   
    result = {
        "type": soil_family or data.get("parentsoil") or "Unknown",  # e.g. "Loam"
        "ph": _extract_number(ph_text),                   # e.g. 7.68
        "ph_rating": _extract_rating(ph_text),            # e.g. "Low Alkaline"
        "moisture": None,                                 # this API has no moisture value
        "nitrogen": _extract_rating(nitrogen_text) or "N/A",     # e.g. "Medium"
        "phosphorus": _extract_rating(phosphorus_text) or "N/A", # e.g. "Medium"
        "potassium": _extract_rating(potassium_text) or "N/A",   # e.g. "Medium"

        # --- extra useful fields (frontend may use these later) ---
        "texture_class": usda_texture,                    # full USDA name, e.g. "Silt Loam"
        "parent_material": data.get("parentsoil"),        # e.g. "Fluvial non calcareous"
        "organic_matter": _strip_html(data.get("organic_matter")),
        "sand": sand_pct,
        "silt": silt_pct,
        "clay": clay_pct,
        "district": data.get("district"),
        "province": data.get("province"),

        # Per-crop fertilizer recommendation from the API (DAP/Urea/MOP...).
        "fertilizer_data": _summarise_fertilizer(data.get("fertilizerData")),
    }

    return result
