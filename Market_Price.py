import requests
import json

# Your API credentials for data.gov.in
API_KEY = "579b464db66ec23bdd000001770d3ba3e3fe45af6ef2729038d544e7"
RESOURCE_ID = "35985678-0d79-46b4-9ed6-6f13308a1d24"

def get_market_price_data(state: str, district: str, commodity: str):
    """
    Fetches the market price for a specific commodity in a given state and district.
    """
    base_url = f"https://api.data.gov.in/resource/{RESOURCE_ID}"
    params = {
        'api-key': API_KEY,
        'format': 'json',
        'filters[State]': state.title(),
        'filters[District]': district.title(),
        'limit': 500
    }

    try:
        response = requests.get(base_url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        records = data.get("records", [])

        if not records:
            return {"status": "error", "message": f"No market data found for {district}, {state}."}

        for record in records:
            if commodity.lower() in record.get('Commodity', '').lower():
                return {
                    "status": "success",
                    "data": {
                        "commodity": record.get('Commodity'),
                        "market": record.get('Market'),
                        "min_price": record.get('Min_Price'),
                        "max_price": record.get('Max_Price'),
                        "modal_price": record.get('Modal_Price')
                    }
                }
        
        return {"status": "not_found", "message": f"Price for '{commodity}' was not available in the {district} market today."}

    except requests.exceptions.RequestException as e:
        return {"status": "error", "message": f"Failed to connect to the market price API: {e}"}
    except Exception as e:
        return {"status": "error", "message": f"An unexpected error occurred while fetching market price: {e}"}

# This block allows you to test this file directly
if __name__ == "__main__":
    try:
        price_data = get_market_price_data("Tamil Nadu", "Dharmapuri", "Watermelon")
        print(json.dumps(price_data, indent=4))
    except Exception as e:
        print(f"An error occurred during testing: {e}")

