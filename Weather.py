import requests
from datetime import datetime, timedelta
import json

def get_weather_data(lat: float, lon: float):
    """
    Fetches historical and forecast weather data for a given latitude and longitude.
    This version is more robust and handles potential None values from the API.
    """
    end_date = datetime.now().strftime("%Y-%m-%d")
    start_date = (datetime.now() - timedelta(days=10)).strftime("%Y-%m-%d")

    # Historical data API call
    hist_url = (
        f"https://archive-api.open-meteo.com/v1/archive?"
        f"latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&timezone=auto"
    )
    hist_response = requests.get(hist_url)
    hist_response.raise_for_status()
    hist_data = hist_response.json()

    # Forecast data API call
    forecast_url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}"
        f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
        f"&forecast_days=7&timezone=auto"
    )
    forecast_response = requests.get(forecast_url)
    forecast_response.raise_for_status()
    forecast_data = forecast_response.json()

    # --- ⭐️ THIS IS THE FIX ⭐️ ---
    # We add 'or 0' to each value to provide a default if the API returns None.
    # This prevents the TypeError.
    weather_data_result = {
        "location": {"latitude": lat, "longitude": lon},
        "historical": [
            {
                "date": hist_data["daily"]["time"][i],
                "temp_max": hist_data["daily"]["temperature_2m_max"][i] or 0,
                "temp_min": hist_data["daily"]["temperature_2m_min"][i] or 0,
                "rainfall": hist_data["daily"]["precipitation_sum"][i] or 0
            }
            for i in range(len(hist_data.get("daily", {}).get("time", [])))
        ],
        "forecast": [
            {
                "date": forecast_data["daily"]["time"][i],
                "temp_max": forecast_data["daily"]["temperature_2m_max"][i] or 0,
                "temp_min": forecast_data["daily"]["temperature_2m_min"][i] or 0,
                "rainfall": forecast_data["daily"]["precipitation_sum"][i] or 0
            }
            for i in range(len(forecast_data.get("daily", {}).get("time", [])))
        ]
    }
    
    return weather_data_result

# This block is for direct testing.
if __name__ == "__main__":
    try:
        # Example coordinates (Coimbatore)
        test_lat = 11.0168
        test_lon = 76.9558
        final_data = get_weather_data(test_lat, test_lon)
        print(f"Successfully fetched weather data for {test_lat}, {test_lon}:")
        print(json.dumps(final_data, indent=4))
    except Exception as e:
        print(f"An error occurred: {e}")
