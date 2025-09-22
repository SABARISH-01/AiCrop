# Weather 


# import requests
# import matplotlib.pyplot as plt
# import datetime

# # Chennai example
# lat, lon = 11.0296, 79.6959 

# # Historical data (last 30 days)
# start_date = "2025-09-10"
# end_date = "2025-09-20"

# url = (
#     f"https://archive-api.open-meteo.com/v1/archive?"
#     f"latitude={lat}&longitude={lon}"
#     f"&start_date={start_date}&end_date={end_date}"
#     f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
#     f"&timezone=auto"
# )

# response = requests.get(url)
# data = response.json()

# dates = data["daily"]["time"]
# temp_max = data["daily"]["temperature_2m_max"]
# temp_min = data["daily"]["temperature_2m_min"]
# rain = data["daily"]["precipitation_sum"]

# # 🔹 Fix: Replace None with 0
# rain = [r if r is not None else 0 for r in rain]

# # Plot temperature & rainfall
# plt.figure(figsize=(10,5))
# plt.plot(dates, temp_max, label="Max Temp (°C)", color="red")
# plt.plot(dates, temp_min, label="Min Temp (°C)", color="blue")
# plt.bar(dates, rain, label="Rainfall (mm)", alpha=0.3, color="skyblue")

# plt.xticks(rotation=45)
# plt.xlabel("Date")
# plt.ylabel("Weather Values")
# plt.title("Historical Weather")
# plt.legend()
# plt.tight_layout()
# plt.show()


import requests
import json

# Converted coordinates
lat, lon = 11.0296, 79.6959  

# Historical data (last 30 days)
start_date = "2010-02-20"
end_date = "2025-09-20"

hist_url = (
    f"https://archive-api.open-meteo.com/v1/archive?"
    f"latitude={lat}&longitude={lon}"
    f"&start_date={start_date}&end_date={end_date}"
    f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
    f"&timezone=auto"
)

hist_data = requests.get(hist_url).json()

# Forecast data (next 7 days)
forecast_url = (
    f"https://api.open-meteo.com/v1/forecast?"
    f"latitude={lat}&longitude={lon}"
    f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum"
    f"&forecast_days=7&timezone=auto"
)

forecast_data = requests.get(forecast_url).json()

# Merge historical + forecast
weather_data = {
    "location": {"latitude": lat, "longitude": lon},
    "historical": [
        {
            "date": hist_data["daily"]["time"][i],
            "temp_max": hist_data["daily"]["temperature_2m_max"][i],
            "temp_min": hist_data["daily"]["temperature_2m_min"][i],
            "rainfall": hist_data["daily"]["precipitation_sum"][i] or 0
        }
        for i in range(len(hist_data["daily"]["time"]))
    ],
    "forecast": [
        {
            "date": forecast_data["daily"]["time"][i],
            "temp_max": forecast_data["daily"]["temperature_2m_max"][i],
            "temp_min": forecast_data["daily"]["temperature_2m_min"][i],
            "rainfall": forecast_data["daily"]["precipitation_sum"][i] or 0
        }
        for i in range(len(forecast_data["daily"]["time"]))
    ]
}

# Print JSON response nicely
print(json.dumps(weather_data, indent=4))