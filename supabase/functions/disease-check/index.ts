import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROMPT = `You are an expert plant pathologist specializing in Indian agriculture. Analyze this crop photo carefully.

Respond ONLY with valid JSON (no markdown, no code fences) with these exact keys:
{
  "disease_name": "exact disease name or 'Healthy Crop' if no disease",
  "severity": "low" or "medium" or "high" or "critical",
  "cause": "why this disease happened in simple farmer-friendly words",
  "immediate_action": "what the farmer should do TODAY",
  "symptoms": ["visible symptom 1", "symptom 2"],
  "medicines": [{"name": "medicine name", "dosage": "exact dosage per acre/liter", "how_to_apply": "step by step application method"}],
  "precautions": ["prevention tip 1", "tip 2"],
  "organic_alternatives": ["organic remedy 1", "remedy 2"],
  "recovery_time": "estimated days/weeks for crop recovery"
}

Be specific with medicine names available in Indian markets (like Mancozeb, Carbendazim, Neem oil etc) and exact dosages.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
    };
    const langName = langMap[language] || "English";
    const langPrompt = language && language !== "en" ? ` Respond in ${langName}.` : "";

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
            { text: PROMPT + langPrompt },
          ],
        }],
        generationConfig: { maxOutputTokens: 1500, temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      result = { raw: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("disease-check error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
