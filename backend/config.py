# -----------------------------------------------------------------------------
# config.py
#
# This file reads the values from the .env file ONCE and gives them a simple
# Python name that the rest of the app can import. Keeping configuration in one
# place means if the key name ever changes, you only fix it here.
# -----------------------------------------------------------------------------

import os                       # "os" lets us read environment variables
from dotenv import load_dotenv  # helper that loads the .env file into the environment

# Read the .env file and put its values into the environment.
# After this line, os.getenv("OPENWEATHER_API_KEY") will work.
load_dotenv()

# Take the API key out of the environment and store it in a normal variable.
# If the key is missing, os.getenv returns None (we check for that later).
API_KEY = os.getenv("OPENWEATHER_API_KEY")
