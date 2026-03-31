import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, language } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Please upload a crop photo." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is missing");
      throw new Error("API key not configured");
    }

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English",
    };
    const langName = langMap[language] || "English";
    const langPrompt = language && language !== "en" ? ` Respond in ${langName}.` : "";

    const prompt = `You are an expert plant pathologist specializing in Indian crops including wheat, rice, cotton, sugarcane, vegetables, and fruits. Carefully analyze this crop photo and provide complete diagnosis.

Respond ONLY with valid JSON (no markdown, no code fences) with these exact keys:
{
  "disease_name": "exact disease name in CAPITAL LETTERS or 'HEALTHY CROP' if no disease",
  "severity": "low" or "medium" or "high" or "critical",
  "affected_percentage": "estimated % of crop affected",
  "cause": "why this disease happened in very simple language a farmer can understand",
  "immediate_action": "what farmer must do TODAY within 24 hours",
  "symptoms": ["visible symptom 1", "symptom 2"],
  "medicines": [{"name": "medicine name", "dosage": "exact dosage e.g. 2ml per litre of water", "how_to_apply": "step by step instructions"}],
  "organic_alternatives": ["safe organic remedy 1", "remedy 2"],
  "precautions": ["prevention tip 1", "tip 2"],
  "recovery_time": "estimated days/weeks for recovery"
}

CRITICAL: NEVER recommend banned pesticides in India: Endosulfan, Monocrotophos, Methyl Parathion, Carbofuran, Phorate, Triazophos, Dimethoate. Always suggest safe approved alternatives.${langPrompt}`;

    // 1 second delay
    await new Promise((r) => setTimeout(r, 1000));

    const makeRequest = async (retry = false): Promise<Response> => {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: "You are an expert plant pathologist specializing in Indian agriculture. Always respond with valid JSON only.",
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageBase64,
                },
              },
              { type: "text", text: prompt },
            ],
          }],
        }),
      });

      if (resp.status === 429 && !retry) {
        console.warn("Rate limited, retrying in 3s...");
        await new Promise((r) => setTimeout(r, 3000));
        return makeRequest(true);
      }

      return resp;
    };

    const response = await makeRequest();

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Claude API error:", response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text || "";

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      result = { raw: content };
    }

    // Filter banned pesticides
    const BANNED = ["endosulfan", "monocrotophos", "methyl parathion", "carbofuran", "phorate", "triazophos", "dimethoate"];
    if (result.medicines) {
      result.medicines = result.medicines.map((m: any) => {
        for (const banned of BANNED) {
          if (m.name?.toLowerCase().includes(banned)) {
            m.name = "[BANNED] " + m.name + " - Use safer alternative";
          }
        }
        return m;
      });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("disease-check error:", e);
    return new Response(
      JSON.stringify({ error: "Sorry, could not analyze the image. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
