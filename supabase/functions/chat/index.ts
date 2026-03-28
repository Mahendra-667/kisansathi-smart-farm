import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const userMessage = messages[messages.length - 1]?.content || "";

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
    };
    const langName = langMap[language] || "English";

    const systemPrompt = `You are KisanAI, India's smartest farming assistant. You know everything about Indian crops, soil types, pests, diseases, government schemes like PM Kisan, Kisan Credit Card, PM Fasal Bima Yojana, Soil Health Card scheme, and APMC regulations. Always respond in ${langName}. Give practical, actionable advice that a farmer can implement immediately. Include specific quantities, timings, and dosages when relevant. Be warm and respectful.`;

    const contents = [
      { role: "user", parts: [{ text: systemPrompt }] },
      { role: "model", parts: [{ text: language === "hi" ? "🙏 नमस्ते! मैं KisanAI हूं। आपकी कैसे मदद करूं?" : "🙏 Namaste! I am KisanAI. How can I help you today?" }] },
      { role: "user", parts: [{ text: userMessage }] },
    ];

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents, generationConfig: { maxOutputTokens: 2048, temperature: 0.4 } }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini API error:", response.status, t);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable. Please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      console.error("Unexpected Gemini response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "Sorry, please try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
