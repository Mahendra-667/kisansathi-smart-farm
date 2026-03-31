import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, imageBase64, language } = await req.json();
    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = { hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English" };
    const langName = langMap[language] || "English";

    const prompt = `You are an expert soil scientist for Indian agriculture. Analyze this soil information and provide a comprehensive report in valid JSON:
{"soil_health_score":"score out of 10","score_explanation":"brief explanation","suitable_crops":[{"crop":"name","reason":"why"}],"organic_improvements":[{"step":"description","quantity":"amount","timing":"when"}],"fertilizer_recommendations":{"organic":[{"name":"fertilizer","quantity":"per acre"}],"chemical":[{"name":"fertilizer","quantity":"per acre"}]},"irrigation_advice":"recommendation","warning_signs":["sign 1"],"improvement_timeline":"timeline"}
Respond in ${langName}. Be specific for Indian farming.${description ? `\n\nSoil description: ${description}` : ""}`;

    const content: any[] = [];
    if (imageBase64) {
      content.push({ type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } });
    }
    content.push({ type: "text", text: prompt });

    await new Promise(r => setTimeout(r, 1000));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are an expert Indian soil scientist. Always respond with valid JSON only." },
          { role: "user", content },
        ],
      }),
    });

    if (!resp.ok) throw new Error(`AI API error: ${resp.status}`);
    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content || "";

    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch { result = { raw: text }; }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("soil-analysis error:", e);
    return new Response(JSON.stringify({ error: "Could not analyze soil. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
