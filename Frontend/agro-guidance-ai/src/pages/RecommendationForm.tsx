import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-landscape.jpg";

interface LocationData {
  [state: string]: {
    [district: string]: string[];
  };
}

interface ApiRequestBody {
  N: number;
  P: number;
  K: number;
  ph: number;
  latitude: number;
  longitude: number;
  state: string;
  district: string;
  farming_method?: string;
  survey_number?: number;
  subdivision?: string;
}

export default function RecommendationForm() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const data: LocationData = {
    Karnataka: {
      Bengaluru: ["Bengaluru North", "Bengaluru South", "Yelahanka"],
      Mysuru: ["Mysuru North", "Mysuru South"],
    },
    "Tamil Nadu": {
      Chennai: ["Tondiarpet", "Mylapore", "Anna Nagar"],
      Coimbatore: ["Pollachi", "Sulur", "Mettupalayam"],
      Dharmapuri: ["Dharmapuri", "Palacode", "Pennagaram"],
      Mayiladuthurai: ["Mayiladuthurai", "Sirkazhi", "Tharangambadi"],
    },
    Kerala: {
      Kochi: ["Fort Kochi", "Mattancherry", "Ernakulam"],
      Thiruvananthapuram: ["Kazhakoottam", "Neyyattinkara"],
    },
    Telangana: {
      Hyderabad: ["Charminar", "Secunderabad", "Golkonda"],
    },
  };

  const states = Object.keys(data);

  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedTaluk, setSelectedTaluk] = useState("");
  const [farmingMethod, setFarmingMethod] = useState("Organic");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [subdivision, setSubdivision] = useState("");
  const [loading, setLoading] = useState(false);

  const districts = selectedState ? Object.keys(data[selectedState]) : [];
  const taluks =
    selectedState && selectedDistrict
      ? data[selectedState][selectedDistrict]
      : [];

  const getCoordinates = (district: string) => {
    const coordinates: { [key: string]: { lat: number; lon: number } } = {
      Chennai: { lat: 13.0827, lon: 80.2707 },
      Coimbatore: { lat: 11.0168, lon: 76.9558 },
      Dharmapuri: { lat: 12.1188, lon: 78.1593 },
      Mayiladuthurai: { lat: 11.0296, lon: 79.6959 },
      Bengaluru: { lat: 12.9716, lon: 77.5946 },
      Mysuru: { lat: 12.2958, lon: 76.6394 },
      Kochi: { lat: 9.9312, lon: 76.2673 },
      Thiruvananthapuram: { lat: 8.5241, lon: 76.9366 },
      Hyderabad: { lat: 17.385, lon: 78.4867 },
    };
    return coordinates[district] || { lat: 11.0296, lon: 79.6959 };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedState || !selectedDistrict) {
      toast({
        title: "Missing Information",
        description: "Please select both state and district.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const apiUrl = "http://127.0.0.1:8000/recommend_crop";
    const coords = getCoordinates(selectedDistrict);

    const requestBody: ApiRequestBody = {
      N: 90,              // Default nitrogen level (can be customized)
      P: 42,              // Default phosphorus level  
      K: 43,              // Default potassium level
      ph: 6.8,            // Default soil pH (slightly acidic, good for most crops)
      latitude: coords.lat,
      longitude: coords.lon,
      state: selectedState,
      district: selectedDistrict,
      farming_method: farmingMethod,
      // Add survey data if provided
      ...(surveyNumber && { survey_number: parseInt(surveyNumber) }),
      ...(subdivision && { subdivision: subdivision }),
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || "Something went wrong!");
      }

      navigate("/recommendation-result", {
        state: {
          result: resultData,
          location: {
            state: selectedState,
            district: selectedDistrict,
            taluk: selectedTaluk,
          },
        },
      });
    } catch (error) {
      toast({
        title: "API Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to get recommendation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <div
        className="relative h-48 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative p-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Form Container */}
      <div className="relative -mt-8 mx-4 mb-4">
        <Card className="rounded-3xl shadow-strong">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Let's find the best crop for you!
              </h1>
              <p className="text-muted-foreground">
                Fill in the details below to get a smart recommendation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* State Selection */}
              <div>
                <select
                  value={selectedState}
                  onChange={(e) => {
                    setSelectedState(e.target.value);
                    setSelectedDistrict("");
                    setSelectedTaluk("");
                  }}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select a State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selection */}
              <div>
                <select
                  value={selectedDistrict}
                  onChange={(e) => {
                    setSelectedDistrict(e.target.value);
                    setSelectedTaluk("");
                  }}
                  disabled={!selectedState}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                  required
                >
                  <option value="">Select a District</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taluk Selection */}
              <div>
                <select
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  disabled={!selectedDistrict}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                >
                  <option value="">Select a Taluk</option>
                  {taluks.map((taluk) => (
                    <option key={taluk} value={taluk}>
                      {taluk}
                    </option>
                  ))}
                </select>
              </div>

              {/* Farming Method */}
              <div>
                <select
                  value={farmingMethod}
                  onChange={(e) => setFarmingMethod(e.target.value)}
                  className="w-full p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Organic">Organic Farming</option>
                  <option value="Inorganic">Conventional Farming</option>
                </select>
              </div>

              {/* Additional Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <input
                  className="p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter Survey Number"
                  type="number"
                  value={surveyNumber}
                  onChange={(e) => setSurveyNumber(e.target.value)}
                />
                <select 
                  className="p-4 border border-border rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  value={subdivision}
                  onChange={(e) => setSubdivision(e.target.value)}
                >
                  <option value="">Sub division</option>
                  <option value="1A">1A</option>
                  <option value="1B">1B</option>
                  <option value="2A">2A</option>
                </select>
              </div>

              <Button
                type="submit"
                disabled={loading || !selectedState || !selectedDistrict}
                className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing your farm data...
                  </>
                ) : (
                  "Get Recommendation"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
