import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string | null> {
  await new Promise(r => setTimeout(r, 1000));
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });
  if (!resp.ok) { console.error("AI error:", resp.status); return null; }
  const data = await resp.json();
  return data?.choices?.[0]?.message?.content || null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lon, language } = await req.json();
    const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_KEY");
    const API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!OPENWEATHER_KEY) throw new Error("Weather service not configured");

    const weatherResp = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`);
    if (!weatherResp.ok) throw new Error("Weather service unavailable");

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

    if (API_KEY) {
      try {
        const langMap: Record<string, string> = { hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English" };
        const langName = langMap[language] || "English";
        const tip = await callAI(
          "You are a practical Indian farming weather advisor. Give short actionable tips.",
          `Current weather: ${result.temp}°C, humidity ${result.humidity}%, wind ${result.wind_speed} m/s, ${result.description}. Give ONE specific practical farming advice for Indian farmers today. Keep it under 2 sentences. Respond in ${langName}.`,
          API_KEY
        );
        if (tip) result.farming_tip = tip;
      } catch (e) { console.error("AI tip error:", e); }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("weather error:", e);
    return new Response(JSON.stringify({ error: "Could not load weather. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
