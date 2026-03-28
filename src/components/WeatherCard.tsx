import { useState, useEffect } from "react";
import { Cloud, Droplets, Wind, Thermometer, Sun, CloudRain, Loader2, MapPin, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  city: string;
  rain: number;
  clouds: number;
  farming_tip?: string;
}

const WeatherCard = () => {
  const { lang } = useLanguage();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke("weather", {
        body: { lat, lon, language: lang },
      });
      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);
      setWeather(data);
      setError("");
    } catch (e: any) {
      setError("Could not load weather");
      console.error("Weather error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
        () => {
          // Default to Delhi if GPS denied
          fetchWeather(28.6139, 77.209);
        },
        { timeout: 10000 }
      );
    } else {
      fetchWeather(28.6139, 77.209);
    }

    // Refresh every 30 minutes
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
          () => fetchWeather(28.6139, 77.209)
        );
      }
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, [lang]);

  if (loading) {
    return (
      <div className="card-farm flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
        <span className="text-sm text-muted-foreground">Loading weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return null;
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="card-farm mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-bold text-foreground text-sm">{weather.city}</span>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{weather.description}</span>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center">
          <img src={iconUrl} alt={weather.description} className="w-14 h-14 -ml-2" />
          <span className="text-3xl font-extrabold text-foreground">{weather.temp}°C</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Thermometer className="w-3.5 h-3.5 text-orange-500" />
            <span>Feels {weather.feels_like}°C</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>{weather.humidity}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Wind className="w-3.5 h-3.5 text-teal-500" />
            <span>{weather.wind_speed} m/s</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <CloudRain className="w-3.5 h-3.5 text-indigo-500" />
            <span>{weather.rain > 0 ? `${weather.rain}mm` : "No rain"}</span>
          </div>
        </div>
      </div>

      {weather.farming_tip && (
        <div className="bg-primary/10 rounded-lg px-3 py-2 flex items-start gap-2">
          <Lightbulb className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-xs text-foreground font-medium leading-relaxed">{weather.farming_tip}</p>
        </div>
      )}
    </motion.div>
  );
};

export default WeatherCard;
