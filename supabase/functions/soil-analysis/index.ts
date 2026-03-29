import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function callClaude(body: any, apiKey: string, retries = 1): Promise<any> {
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
  if (resp.status === 429 && retries > 0) {
    await new Promise(r => setTimeout(r, 3000));
    return callClaude(body, apiKey, retries - 1);
  }
  if (!resp.ok) throw new Error(`Claude API error: ${resp.status}`);
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { description, imageBase64, language } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("API key not configured");

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
    };
    const langName = langMap[language] || "English";

    const prompt = `You are an expert soil scientist for Indian agriculture. Analyze this soil information and provide a comprehensive report in valid JSON format:
{
  "soil_health_score": "score out of 10",
  "score_explanation": "brief explanation",
  "suitable_crops": [{"crop": "name", "reason": "why suitable"}],
  "organic_improvements": [{"step": "description", "quantity": "exact amount", "timing": "when to do"}],
  "fertilizer_recommendations": {"organic": [{"name": "fertilizer", "quantity": "per acre"}], "chemical": [{"name": "fertilizer", "quantity": "per acre"}]},
  "irrigation_advice": "specific irrigation recommendation",
  "warning_signs": ["sign to watch 1", "sign 2"],
  "improvement_timeline": "expected improvement timeline"
}
Respond in ${langName}. Be specific with quantities relevant to Indian farming.`;

    const content: any[] = [];
    if (imageBase64) {
      content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data: imageBase64 } });
    }
    content.push({ type: "text", text: prompt + (description ? `\n\nSoil description from farmer: ${description}` : "") });

    const data = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      system: "You are an expert Indian soil scientist. Always respond with valid JSON only.",
      messages: [{ role: "user", content }],
    }, ANTHROPIC_API_KEY);

    const text = data?.content?.[0]?.text || "";
    let result;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };
    } catch {
      result = { raw: text };
    }

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
