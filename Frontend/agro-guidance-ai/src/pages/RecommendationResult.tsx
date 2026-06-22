import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Info, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import riceImage from "@/assets/rice-crop.jpg";

interface WeatherForecast {
  date: string;
  temp_max: number;
  temp_min: number;
  rainfall: number;
}

interface ProcessedWeatherData {
  calculated_avg_temperature: number;
  calculated_total_rainfall: number;
  assumed_humidity: number;
}

interface MarketData {
  commodity?: string;
  market?: string;
  min_price?: string;
  max_price?: string;
  modal_price?: string;
  info?: string;
}

interface RecommendationData {
  recommended_crop: string;
  processed_weather_data?: ProcessedWeatherData;
  market_data?: MarketData;
  cultivation_plan?: string;  
  weather_forecast_7_days?: WeatherForecast[];  
  reason?: string;
}

interface LocationInfo {
  state: string;
  district: string;
  taluk?: string;
}

export default function RecommendationResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // --- ⭐️ FIXED: Handle undefined result gracefully ⭐️ ---
  const result = location.state?.result as RecommendationData | undefined;
  const locationInfo = location.state?.location as LocationInfo | undefined;

  if (!result) {
    return (
      <div className="mobile-container flex items-center justify-center min-h-screen">
        <div className="text-center p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">No Data Available</h2>
          <p className="mb-4 text-gray-600">
            Recommendation data is missing. Please go back to the form and submit your details.
          </p>
          <Button onClick={() => navigate("/recommendation")} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back to Form
          </Button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => alert("PDF download feature coming soon!");

  // --- ⭐️ THIS IS THE FIX ⭐️ ---
  // We use optional chaining (?.) and nullish coalescing (??) to prevent errors
  const temp = result.processed_weather_data?.calculated_avg_temperature?.toFixed(1) ?? 'N/A';
  const rainfall = result.processed_weather_data?.calculated_total_rainfall?.toFixed(1) ?? 'N/A';
  const humidity = result.processed_weather_data?.assumed_humidity ?? 'N/A';
  const marketPrice = result.market_data?.modal_price ?? 'Not Available';
  const marketLocation = result.market_data?.market ?? 'Local Market';
  const minPrice = result.market_data?.min_price ?? 'N/A';
  const maxPrice = result.market_data?.max_price ?? 'N/A';

  return (
    <div className="mobile-container pb-20">
      {/* Header */}
      <div className="bg-primary p-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
        
        <div className="text-center text-primary-foreground">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden shadow-medium">
            <img src={riceImage} alt={result.recommended_crop} className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{result.recommended_crop}</h1>
          <p className="text-primary-foreground/80">
            {locationInfo?.district || 'Unknown District'}, {locationInfo?.state || 'Unknown State'}
          </p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Weather & Soil Info */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Soil & Weather</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span className="font-medium">{temp}°C</span>
              </div>
              <div className="flex justify-between">
                <span>Rainfall:</span>
                <span className="font-medium">{rainfall}mm</span>
              </div>
              <div className="flex justify-between">
                <span>Humidity:</span>
                <span className="font-medium">{humidity}%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Market Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {result.market_data?.info ? (
                <p className="text-warning">{result.market_data.info}</p>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span>Market:</span>
                    <span className="font-medium">{marketLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-medium text-success">₹{marketPrice}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Range: ₹{minPrice} - ₹{maxPrice}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cultivation Plan */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">Cultivation Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="mb-3">Recommended Plan</Badge>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.cultivation_plan || 'Cultivation plan will be provided based on local conditions and best practices.'}
            </p>
          </CardContent>
        </Card>

        {/* AI Reasoning */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg">AI Recommendation Reasoning</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {result.reason || 'This recommendation is based on soil conditions, weather patterns, and market trends in your area.'}
            </p>
          </CardContent>
        </Card>

        {/* Weather Forecast */}
        {result.weather_forecast_7_days && result.weather_forecast_7_days.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">7-Day Weather Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.weather_forecast_7_days.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">
                        {new Date(day?.date || Date.now()).toLocaleDateString("en-US", { 
                          month: "short", 
                          day: "numeric" 
                        })}
                      </p>
                      {(day?.rainfall ?? 0) > 0 && (
                        <p className="text-xs text-blue-600">Rain: {day.rainfall}mm</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {Math.round(day?.temp_max ?? 0)}° / {Math.round(day?.temp_min ?? 0)}°
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1">
            <Info className="w-4 h-4" />
            <span className="text-xs">More Info</span>
          </Button>
          
          <Button variant="outline" size="sm" className="flex flex-col h-16 gap-1">
            <BarChart3 className="w-4 h-4" />
            <span className="text-xs">Compare</span>
          </Button>
          
          <Button 
            onClick={handleDownloadPDF}
            size="sm" 
            className="flex flex-col h-16 gap-1"
          >
            <Download className="w-4 h-4" />
            <span className="text-xs">Download</span>
          </Button>
        </div>
      </div>
    </div>
  );
}