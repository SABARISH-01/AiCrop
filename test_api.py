import requests
import json

def test_api():
    base_url = "http://127.0.0.1:8000/recommend_crop"
    
    # Test 1: Special condition (Survey 134, Subdivision 1A)
    print("=== TEST 1: Special Condition (Survey 134 + Subdivision 1A) ===")
    special_data = {
        "N": 80, "P": 40, "K": 40, "ph": 6.5,
        "latitude": 11.1271, "longitude": 79.9570,
        "state": "Tamil Nadu", "district": "Mayiladuthurai",
        "farming_method": "Organic",
        "survey_number": 134, "subdivision": "1A"
    }
    
    try:
        response = requests.post(base_url, json=special_data)
        result = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"🌾 Crop: {result.get('recommended_crop')}")
        print(f"💰 Price: ₹{result.get('market_data', {}).get('modal_price')} ({result.get('market_data', {}).get('market')})")
        print(f"🌡️ Temp: {result.get('processed_weather_data', {}).get('calculated_avg_temperature')}°C")
        print(f"🌧️ Rainfall: {result.get('processed_weather_data', {}).get('calculated_total_rainfall')}mm")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Regular case (Mayiladuthurai fallback)
    print("=== TEST 2: Regular Case (Mayiladuthurai Fallback) ===")
    regular_data = {
        "N": 80, "P": 40, "K": 40, "ph": 6.5,
        "latitude": 11.1271, "longitude": 79.9570,
        "state": "Tamil Nadu", "district": "Mayiladuthurai",
        "farming_method": "Organic"
    }
    
    try:
        response = requests.post(base_url, json=regular_data)
        result = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"🌾 Crop: {result.get('recommended_crop')}")
        print(f"💰 Price: ₹{result.get('market_data', {}).get('modal_price')} ({result.get('market_data', {}).get('market')})")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")

    # Test 3: Different district (General fallback)
    print("=== TEST 3: Other District (General Fallback) ===")
    other_data = {
        "N": 80, "P": 40, "K": 40, "ph": 6.5,
        "latitude": 11.1271, "longitude": 79.9570,
        "state": "Tamil Nadu", "district": "Thanjavur",
        "farming_method": "Organic"
    }
    
    try:
        response = requests.post(base_url, json=other_data)
        result = response.json()
        print(f"✅ Status: {response.status_code}")
        print(f"🌾 Crop: {result.get('recommended_crop')}")
        print(f"💰 Price: ₹{result.get('market_data', {}).get('modal_price')} ({result.get('market_data', {}).get('market')})")
        print()
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_api()