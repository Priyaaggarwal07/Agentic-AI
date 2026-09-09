import time, requests
from functools import lru_cache

_SG_URL = "https://rest.isric.org/soilgrids/v2.0/properties/query"
# raw integer -> conventional unit divisor
_SG_FACTOR = {"phh2o": 10, "nitrogen": 100, "soc": 10, "sand": 10, "silt": 10, "clay": 10}

@lru_cache(maxsize=4096)  # soil doesn't change between queries -> cache per (lat,lon,prop)
def soil_property(lat: float, lon: float, prop: str = "phh2o", depth: str = "0-5cm"):
    """Return one SoilGrids property in conventional units, or None if unavailable."""
    params = {"lon": round(lon, 4), "lat": round(lat, 4),
              "property": prop, "depth": depth, "value": "mean"}
    for attempt in range(3):
        try:
            r = requests.get(_SG_URL, params=params, timeout=45)
            print(f"soil_property({lat},{lon},{prop}) -> {r.status_code}")
            if r.status_code in (502, 503, 504):
                time.sleep(2 * (attempt + 1)); continue      # backoff on gateway errors
            r.raise_for_status()
            raw = r.json()["properties"]["layers"][0]["depths"][0]["values"]["mean"]
            if raw is None:
                return None                                   # no-data pixel
            return raw / _SG_FACTOR.get(prop, 1)
        except (requests.Timeout, requests.ConnectionError, ValueError, KeyError):
            time.sleep(2 * (attempt + 1))
    return None   # give up gracefully -> caller falls back to generic advice


if __name__ == "__main__":

    lat = 28.5516
    lon = 77.2505

    print("Testing SoilGrids API...\n")

    ph = soil_property(lat, lon, "phh2o")
    print("pH:", ph)

    nitrogen = soil_property(lat, lon, "nitrogen")
    print("Nitrogen:", nitrogen)

    clay = soil_property(lat, lon, "clay")
    print("Clay:", clay)

    sand = soil_property(lat, lon, "sand")
    print("Sand:", sand)

    silt = soil_property(lat, lon, "silt")
    print("Silt:", silt)

    soc = soil_property(lat, lon, "soc")
    print("Organic Carbon:", soc)