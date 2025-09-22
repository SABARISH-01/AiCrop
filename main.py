import uvicorn
from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import datetime
import requests
import os
import random

# --- Import real data functions ---
from Market_Price import get_market_price_data

# --- Initialize FastAPI App ---
app = FastAPI()

# --- Load the AI Model on startup ---
try:
    # Load the pre-trained Random Forest model
    model = joblib.load('crop_model_v2.joblib')
    print("AI model (crop_model_v2.joblib) loaded successfully.")
except FileNotFoundError:
    model = None
    print("Error: AI model file not found. The API will not be able to make predictions.")

# --- Define Input Data Model ---
class FarmerData(BaseModel):
    N: int
    P: int
    K: int
    ph: float
    latitude: float
    longitude: float
    state: str
    district: str
    farming_method: str = "inorganic" # Default to inorganic

# --- New: Organic/Inorganic Guidance System ---
class CultivationGuidance:
    def __init__(self, organic_plan, inorganic_plan):
        self.organic_plan = organic_plan
        self.inorganic_plan = inorganic_plan

CROP_GUIDANCE = {
    "Rice": CultivationGuidance(
        organic_plan="Organic: Use cow dung compost and bio-fertilizers. Maintain natural water levels. Use neem oil for pests.",
        inorganic_plan="Inorganic: Use Urea (N), DAP (P), and Muriate of Potash (K). Apply pesticides as needed. Use modern irrigation techniques."
    ),
    "Maize": CultivationGuidance(
        organic_plan="Organic: Plant in well-drained soil with a mix of cow dung manure. Use crop rotation to control pests. Apply compost tea.",
        inorganic_plan="Inorganic: Use NPK fertilizers during planting. Apply specific herbicides for weed control. Monitor for corn borer and use pesticides."
    ),
    "Pigeon Pea": CultivationGuidance(
        organic_plan="Organic: Fertilize with compost and plant cover crops. Use natural pest controls like ladybugs. Harvest by hand.",
        inorganic_plan="Inorganic: Apply a small amount of NPK at sowing. Use chemical pesticides for pod borer. Harvest with machines for efficiency."
    ),
    "Wheat": CultivationGuidance(
        organic_plan="Organic: Use green manure and compost. Control weeds with manual weeding. Use natural fungicides for rust.",
        inorganic_plan="Inorganic: Apply urea and DAP. Use broadleaf herbicides. Monitor for fungal diseases and apply chemical fungicides."
    )
}

# --- Function to get real weather data from Open-Meteo ---
def get_real_weather_data(lat, lon):
    """
    Fetches real historical and forecast weather data using Open-Meteo APIs.
    """
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=30)
    
    try:
        # Historical data (last 30 days)
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

        # Process historical data to get averages
        hist_temps = hist_data['daily']['temperature_2m_max']
        hist_rainfall = hist_data['daily']['precipitation_sum']
        
        avg_temperature = np.mean(hist_temps)
        total_rainfall = np.sum(hist_rainfall)
        
        # Process forecast data
        weather_forecast_7_days = []
        if 'daily' in forecast_data:
            for i in range(len(forecast_data['daily']['time'])):
                weather_forecast_7_days.append({
                    "date": forecast_data['daily']['time'][i],
                    "temp_max": forecast_data['daily']['temperature_2m_max'][i],
                    "temp_min": forecast_data['daily']['temperature_2m_min'][i],
                    "rainfall": forecast_data['daily']['precipitation_sum'][i] or 0
                })

        return {
            "avg_temperature": avg_temperature,
            "total_rainfall": total_rainfall,
            "forecast": weather_forecast_7_days
        }
    except Exception as e:
        print(f"Weather API error: {e}")
        return {
            "avg_temperature": 25,
            "total_rainfall": 50,
            "forecast": []
        }

# --- Function to get mock soil data from GEE ---
def get_soil_data_from_gee(lat, lon):
    """
    Simulates fetching soil data from Google Earth Engine.
    In a real app, this would use the GEE Python API.
    For the prototype, it returns mock data based on location.
    """
    # Simple rule-based mock for demo
    if lat > 25: # Northern states
        soil_ph = 7.5
        nutrients = {"N": 40, "P": 20, "K": 35}
    else: # Southern states
        soil_ph = 6.0
        nutrients = {"N": 70, "P": 50, "K": 60}
    
    return {
        "ph": soil_ph,
        "nutrients": nutrients
    }

# --- API Endpoint for Recommendation ---
@app.post("/recommend_crop")
def recommend_crop(data: FarmerData):
    if model is None:
        return {"error": "AI model is not loaded. Please check server logs."}

    # --- 1. Get real weather data from Open-Meteo ---
    weather_data = get_real_weather_data(data.latitude, data.longitude)
    avg_temperature = weather_data['avg_temperature']
    total_rainfall = weather_data['total_rainfall']
    
    # For a prototype, assume a constant humidity. This can be replaced by an API call later.
    avg_humidity = 70.0

    # --- 2. Get real soil data from simulated GEE function ---
    soil_data = get_soil_data_from_gee(data.latitude, data.longitude)
    
    # For the prototype, we use the user's N, P, K from the input, but this could be from GEE
    final_N = data.N or soil_data['nutrients']['N']
    final_P = data.P or soil_data['nutrients']['P']
    final_K = data.K or soil_data['nutrients']['K']
    final_ph = data.ph or soil_data['ph']
    
    # --- 3. Get market data ---
    crop_for_market = "Rice" # Placeholder for demo
    market_response = get_market_price_data(data.state, data.district, crop_for_market)
    
    market_data_display = {}
    if market_response.get("status") == "success":
        market_data_display = market_response.get("data")
        # ⭐ New: Simulate a price trend prediction using a simple rule-based system
        market_data_display["price_trend_forecast"] = "Prices for Rice are predicted to be stable."
    else:
        market_data_display = {"info": market_response.get("message", "Market price data could not be retrieved."), "price_trend_forecast": "Price trend cannot be predicted due to missing data."}


    # --- 4. Prepare data for the AI model ---
    input_data = pd.DataFrame([[
        final_N,
        final_P,
        final_K,
        avg_temperature,
        avg_humidity,
        final_ph,
        total_rainfall,
    ]], columns=['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'])
    
    # --- 5. Use the AI model to make a prediction ---
    predicted_crop_index = model.predict(input_data)[0]
    
    # Map the index back to a crop name
    crop_names = ['Rice', 'Maize', 'Pigeon Pea', 'Cotton', 'Wheat', 'Millet', 'Sorghum']
    recommended_crop = crop_names[predicted_crop_index]

    # --- 6. Get cultivation guidance ---
    guidance = CROP_GUIDANCE.get(recommended_crop, CROP_GUIDANCE["Rice"]) # Fallback to Rice guidance if not found
    if data.farming_method.lower() == "organic":
        cultivation_plan = guidance.organic_plan
    else:
        cultivation_plan = guidance.inorganic_plan

    # --- 7. Construct and Return the Final, Enriched Result ---
    return {
        "recommended_crop": recommended_crop,
        "input_data_summary": {
            "soil_N": final_N,
            "soil_P": final_P,
            "soil_K": final_K,
            "soil_ph": final_ph
        },
        "processed_weather_data": {
            "calculated_avg_temperature_last_30d": round(avg_temperature, 2),
            "calculated_total_rainfall_last_30d": round(total_rainfall, 2),
            "assumed_humidity": avg_humidity
        },
        "market_data": market_data_display,
        "cultivation_plan": cultivation_plan,
        "weather_forecast_7_days": weather_data.get("forecast", []),
        "reason": f"AI model recommends '{recommended_crop}' based on soil conditions and recent weather patterns. Market and forecast data are provided for planning."
    }

@app.get("/")
def home():
    return {"message": "Welcome to the AI Crop Recommendation API. Use the /recommend_crop endpoint to get a recommendation."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
