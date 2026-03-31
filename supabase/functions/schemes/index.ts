import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { profile, language } = await req.json();
    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = { hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English" };
    const langName = langMap[language] || "English";

    const profileInfo = profile
      ? `Farmer: ${profile.name || "Farmer"}, State: ${profile.state || "India"}, Farm Size: ${profile.farmSize || "Unknown"} acres, Crops: ${profile.crops || "General"}`
      : "General Indian farmer";

    const prompt = `${profileInfo}\n\nList top 5 most relevant Indian government agricultural schemes for this farmer. Respond in valid JSON array:\n[{"name":"scheme name","benefit":"benefit description","eligibility":["point 1"],"how_to_apply":["step 1"],"website":"official URL"}]\nRespond in ${langName}.`;

    await new Promise(r => setTimeout(r, 1000));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert on Indian government agricultural schemes. Respond with valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!resp.ok) throw new Error(`AI API error: ${resp.status}`);
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch { result = []; }

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
