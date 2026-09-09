# -----------------------------------------------------------------------------
# test_soil.py
#
# A tiny manual test for soil.py. It is NOT a fancy test framework — it just
# calls soil_property() with real coordinates and prints the results so you can
# see the function working.
#
# Run it (with your virtual environment active) from the backend/ folder:
#     python test_soil.py
#
# NOTE: this makes REAL network calls to SoilGrids, so it needs internet and
# can take several seconds per property (the API is slow).
# -----------------------------------------------------------------------------

from soil import soil_property

# A land location: Bhubaneswar, India. Should return real soil numbers.
LAT, LON = 20.2961, 85.8245

# The soil properties this function understands (see _SG_FACTOR in soil.py).
properties = ["phh2o", "nitrogen", "soc", "sand", "silt", "clay"]

print(f"Testing soil at lat={LAT}, lon={LON}\n")

for prop in properties:
    value = soil_property(LAT, LON, prop)   # one API call per property
    print(f"  {prop:<9} -> {value}")

# Edge case: a point in the middle of the ocean has no soil data.
# The function should return None here (a "no-data pixel").
print("\nTesting an ocean point (expect None):")
ocean_value = soil_property(0.0, -140.0, "phh2o")
print(f"  phh2o -> {ocean_value}")

print("\nDone.")
