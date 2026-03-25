import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const messages: any[] = [
      {
        role: "system",
        content: `You are KisanAI Disease Detector, an expert Indian agricultural pathologist. When shown a crop/plant photo, you must:

1. **Disease Name**: Identify the disease (common name + scientific name)
2. **Cause**: Explain why it happened (environmental conditions, pathogens, etc.)
3. **Symptoms**: Describe visible symptoms
4. **Medicine**: Recommend specific medicines with exact dosages (e.g., "Mancozeb 75% WP — 2.5g/L spray")
5. **Precautions**: Preventive measures for future protection

Format your response as JSON with this structure:
{
  "disease_name": "Common Name (Scientific Name)",
  "severity": "low" | "medium" | "high" | "critical",
  "cause": "explanation",
  "symptoms": ["symptom1", "symptom2"],
  "medicines": [{"name": "Medicine Name", "dosage": "dosage instructions"}],
  "precautions": ["precaution1", "precaution2"],
  "organic_alternatives": ["alternative1", "alternative2"]
}

If the image is not a plant/crop or no disease is visible, respond with:
{"disease_name": "Healthy / Not a crop image", "severity": "low", "cause": "No disease detected", "symptoms": [], "medicines": [], "precautions": ["Continue regular monitoring"], "organic_alternatives": []}`
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
          },
          {
            type: "text",
            text: "Identify any disease in this crop photo. Provide diagnosis, medicine recommendations, and precautions."
          }
        ]
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Try to parse JSON from the response
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
