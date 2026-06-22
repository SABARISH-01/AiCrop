import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-landscape.jpg";

interface WeatherData {
  temp_max: number;
  temp_min: number;
  rainfall: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const lat = 11.0168;
      const lon = 76.9558;
      const apiUrl = `http://127.0.0.1:8000/weather?latitude=${lat}&longitude=${lon}`;

      try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Weather data not available");
        }
        const data = await response.json();
        if (data.forecast && data.forecast.length > 0) {
          setWeather(data.forecast[0]);
        }
      } catch (error) {
        console.error("Failed to fetch weather:", error);
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  return (
    <div className="mobile-container">
      {/* Weather Header */}
      <div 
        className="relative h-64 bg-cover bg-center rounded-b-3xl overflow-hidden"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        
        <div className="relative p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Good Morning 👋</p>
              <h2 className="text-xl font-semibold">Saravanan</h2>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              🔔
            </div>
          </div>

          <div className="glass rounded-2xl p-4 mt-auto">
            <div className="flex items-center gap-2 text-sm mb-2">
              📍 <span>Coimbatore, Tamil Nadu</span>
            </div>
            
            {loading ? (
              <div className="text-2xl font-bold text-gray-700">Loading...</div>
            ) : weather ? (
              <>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {Math.round(weather.temp_max)}°C
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {dateTime.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  | {dateTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex gap-4 text-xs text-gray-600">
                  <span>🌤️ {weather.rainfall > 0 ? 'Rainy' : 'Partly Cloudy'}</span>
                  <span>💨 Wind: 7 mph</span>
                  <span>💧 Humidity: 54%</span>
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-700">Weather Unavailable</div>
            )}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div
            className="bg-card rounded-2xl p-6 text-center interactive cursor-pointer shadow-soft"
            onClick={() => navigate("/recommendation")}
          >
            <div className="text-3xl mb-3">🌾</div>
            <p className="text-sm font-medium text-foreground">Crop Recommendation</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 text-center interactive cursor-pointer shadow-soft">
            <div className="text-3xl mb-3">📘</div>
            <p className="text-sm font-medium text-foreground">Cropping Guide</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 text-center interactive cursor-pointer shadow-soft">
            <div className="text-3xl mb-3">🧬</div>
            <p className="text-sm font-medium text-foreground">Crop Disease Detection</p>
          </div>
          
          <div className="bg-card rounded-2xl p-6 text-center interactive cursor-pointer shadow-soft">
            <div className="text-3xl mb-3">📊</div>
            <p className="text-sm font-medium text-foreground">Market Analysis</p>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl">
        <div className="flex justify-around py-4">
          <div className="flex flex-col items-center text-primary">
            <span className="text-xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center text-muted-foreground">
            <span className="text-xl mb-1">📊</span>
            <span className="text-xs">Statistic</span>
          </div>
          <div className="flex flex-col items-center text-muted-foreground">
            <span className="text-xl mb-1">📰</span>
            <span className="text-xs">News</span>
          </div>
          <div className="flex flex-col items-center text-muted-foreground">
            <span className="text-xl mb-1">👤</span>
            <span className="text-xs">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}