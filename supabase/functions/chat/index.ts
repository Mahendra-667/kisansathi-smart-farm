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
    const { messages, language, profile } = await req.json();

    const API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!API_KEY) {
      console.error("LOVABLE_API_KEY is missing");
      throw new Error("API key not configured");
    }

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English",
    };
    const langName = langMap[language] || "English";

    const profileInfo = profile
      ? `Farmer Profile: Name: ${profile.name || "Farmer"}, Village: ${profile.village || "Unknown"}, District: ${profile.district || "Unknown"}, State: ${profile.state || "Unknown"}, Farm Size: ${profile.farmSize || "Unknown"} acres, Main Crops: ${profile.crops || "General"}.`
      : "";

    const systemPrompt = `You are KisanAI, India's smartest AI farming assistant. You have deep knowledge of all Indian crops, soil types, pest control, irrigation, harvesting, and government agricultural schemes including PM Kisan Samman Nidhi, Soil Health Card scheme, Pradhan Mantri Fasal Bima Yojana, Kisan Credit Card, eNAM, and Paramparagat Krishi Vikas Yojana. Always give practical, actionable advice for Indian farming. Respond ONLY in ${langName}. ${profileInfo} NEVER recommend banned pesticides: Endosulfan, Monocrotophos, Methyl Parathion, Carbofuran, Phorate, Triazophos, Dimethoate.`;

    // Build clean messages array
    const apiMessages: Array<{role: string; content: string}> = [
      { role: "system", content: systemPrompt },
    ];
    
    if (messages && Array.isArray(messages)) {
      for (const m of messages.slice(-10)) {
        const role = m.role === "assistant" ? "assistant" : "user";
        const content = typeof m.content === "string" ? m.content : String(m.content);
        if (content.trim()) {
          apiMessages.push({ role, content });
        }
      }
    }

    // Ensure at least one user message
    if (apiMessages.length === 1) {
      apiMessages.push({ role: "user", content: "Hello" });
    }

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
        messages: apiMessages,
      }),
    });

    if (resp.status === 429) {
      console.warn("Rate limited, retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
      const retryResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: apiMessages,
        }),
      });
      if (!retryResp.ok) {
        const t = await retryResp.text();
        console.error("Retry failed:", retryResp.status, t);
        throw new Error("API retry failed");
      }
      const data = await retryResp.json();
      const aiResponse = data?.choices?.[0]?.message?.content || "Sorry, please try again.";
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("AI API error:", resp.status, errorText);
      throw new Error(`AI API error: ${resp.status}`);
    }

    const data = await resp.json();
    const aiResponse = data?.choices?.[0]?.message?.content;

    if (!aiResponse) {
      console.error("Empty response, full data:", JSON.stringify(data));
      throw new Error("Empty response");
    }

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: "Sorry, please try again later." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
