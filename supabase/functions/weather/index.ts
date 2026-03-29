import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callClaude(body: any, apiKey: string): Promise<any> {
  await new Promise(r => setTimeout(r, 1000));
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const t = await resp.text();
    console.error("Claude error:", resp.status, t);
    return null;
  }
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat, lon, language } = await req.json();
    const OPENWEATHER_KEY = Deno.env.get("OPENWEATHER_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    if (!OPENWEATHER_KEY) throw new Error("Weather service not configured");

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
    const weatherResp = await fetch(weatherUrl);

    if (!weatherResp.ok) {
      const t = await weatherResp.text();
      console.error("OpenWeather error:", weatherResp.status, t);
      throw new Error("Weather service unavailable");
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

    if (ANTHROPIC_API_KEY) {
      try {
        const langMap: Record<string, string> = {
          hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
        };
        const langName = langMap[language] || "English";

        const tipPrompt = `Current weather: ${result.temp}°C, humidity ${result.humidity}%, wind ${result.wind_speed} m/s, ${result.description}, rain ${result.rain}mm, clouds ${result.clouds}%. Give ONE specific practical farming advice for Indian farmers today based on this weather. Keep it under 2 sentences. Respond in ${langName}.`;

        const data = await callClaude({
          model: "claude-sonnet-4-20250514",
          max_tokens: 150,
          system: "You are a practical Indian farming weather advisor. Give short actionable tips.",
          messages: [{ role: "user", content: tipPrompt }],
        }, ANTHROPIC_API_KEY);

        if (data?.content?.[0]?.text) {
          result.farming_tip = data.content[0].text;
        }
      } catch (e) {
        console.error("Claude tip error:", e);
      }
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
