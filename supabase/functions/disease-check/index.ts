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

    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) {
      console.error("LOVABLE_API_KEY is missing");
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
  "cause": "why this disease happened in simple language",
  "immediate_action": "what farmer must do TODAY",
  "symptoms": ["symptom 1", "symptom 2"],
  "medicines": [{"name": "medicine name", "dosage": "exact dosage", "how_to_apply": "instructions"}],
  "organic_alternatives": ["organic remedy 1", "remedy 2"],
  "precautions": ["prevention tip 1", "tip 2"],
  "recovery_time": "estimated recovery time"
}

CRITICAL: NEVER recommend banned pesticides: Endosulfan, Monocrotophos, Methyl Parathion, Carbofuran, Phorate, Triazophos, Dimethoate.${langPrompt}`;

    // 1 second delay
    await new Promise((r) => setTimeout(r, 1000));

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert plant pathologist specializing in Indian agriculture. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });

    if (resp.status === 429) {
      console.warn("Rate limited, retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
      // Simple retry - just throw and let the catch handle it
      throw new Error("Rate limited");
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("AI API error:", resp.status, errorText);
      throw new Error(`AI API error: ${resp.status}`);
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "";

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
