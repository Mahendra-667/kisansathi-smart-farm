import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lon, language } = await req.json();
    const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!OPENWEATHER_KEY) throw new Error("OPENWEATHER_KEY not configured");

    // Fetch weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
    const weatherResp = await fetch(weatherUrl);

    if (!weatherResp.ok) {
      const t = await weatherResp.text();
      console.error("OpenWeather error:", weatherResp.status, t);
      return new Response(JSON.stringify({ error: "Weather service unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const weather = await weatherResp.json();

    const result: any = {
      temp: Math.round(weather.main?.temp),
      feels_like: Math.round(weather.main?.feels_like),
      humidity: weather.main?.humidity,
      wind_speed: weather.wind?.speed,
      description: weather.weather?.[0]?.description,
      icon: weather.weather?.[0]?.icon,
      city: weather.name,
      rain: weather.rain?.["1h"] || weather.rain?.["3h"] || 0,
      clouds: weather.clouds?.all || 0,
    };

    // Generate farming tip with Gemini if available
    if (GEMINI_API_KEY) {
      try {
        const langMap: Record<string, string> = {
          hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
        };
        const langName = langMap[language] || "English";

        const tipPrompt = `Current weather: ${result.temp}°C, humidity ${result.humidity}%, wind ${result.wind_speed} m/s, ${result.description}, rain ${result.rain}mm, clouds ${result.clouds}%. Give ONE short practical farming tip for today based on this weather. Max 2 sentences. Respond in ${langName}. Examples: "Good day to spray pesticides - low wind and no rain expected" or "Delay irrigation - rain expected today".`;

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: tipPrompt }] }],
              generationConfig: { maxOutputTokens: 150, temperature: 0.5 },
            }),
          }
        );

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          result.farming_tip = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.error("Gemini tip error:", e);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
