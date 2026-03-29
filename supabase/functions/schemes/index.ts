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
  if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, language } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
    };
    const langName = langMap[language] || "English";

    const profileInfo = profile
      ? `Farmer: ${profile.name || "Farmer"}, State: ${profile.state || "India"}, Farm Size: ${profile.farmSize || "Unknown"} acres, Crops: ${profile.crops || "General"}, Farming Type: ${profile.farmingType || "Conventional"}`
      : "General Indian farmer";

    const prompt = `${profileInfo}

List top 5 most relevant Indian government agricultural schemes for this farmer. Respond in valid JSON array:
[{
  "name": "scheme name",
  "benefit": "benefit amount or description",
  "eligibility": ["point 1", "point 2"],
  "how_to_apply": ["step 1", "step 2"],
  "website": "official URL"
}]
Respond in ${langName}.`;

    const data = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: "You are an expert on Indian government agricultural schemes. Respond with valid JSON only.",
      messages: [{ role: "user", content: prompt }],
    }, ANTHROPIC_API_KEY);

    const text = data?.content?.[0]?.text || "";
    let result;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch {
      result = [];
    }

    return new Response(JSON.stringify({ schemes: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("schemes error:", e);
    return new Response(JSON.stringify({ error: "Could not load schemes." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
