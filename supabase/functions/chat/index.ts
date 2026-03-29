import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const BANNED_PESTICIDES = ["endosulfan", "monocrotophos", "methyl parathion", "carbofuran", "phorate", "triazophos", "dimethoate"];

function filterBannedPesticides(text: string): string {
  let filtered = text;
  for (const p of BANNED_PESTICIDES) {
    const regex = new RegExp(p, "gi");
    if (regex.test(filtered)) {
      filtered = filtered.replace(regex, "[BANNED - use safer alternative]");
    }
  }
  return filtered;
}

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

  if (!resp.ok) {
    const t = await resp.text();
    console.error("Claude API error:", resp.status, t);
    throw new Error(`Claude API error: ${resp.status}`);
  }

  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, language, profile } = await req.json();
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("API key not configured");

    const userMessage = messages[messages.length - 1]?.content || "";
    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
    };
    const langName = langMap[language] || "English";

    const profileInfo = profile
      ? `Farmer Profile: Name: ${profile.name || "Farmer"}, Village: ${profile.village || "Unknown"}, District: ${profile.district || "Unknown"}, State: ${profile.state || "Unknown"}, Farm Size: ${profile.farmSize || "Unknown"} acres, Main Crops: ${profile.crops || "General"}, Farming Type: ${profile.farmingType || "Conventional"}.`
      : "No profile available.";

    const systemPrompt = `You are KisanAI, India's smartest AI farming assistant. You have deep knowledge of all Indian crops, soil types, pest control, irrigation methods, harvesting techniques, post-harvest storage, and government agricultural schemes including PM Kisan Samman Nidhi, Soil Health Card scheme, Pradhan Mantri Fasal Bima Yojana, Kisan Credit Card, eNAM (electronic national agriculture market), and Paramparagat Krishi Vikas Yojana for organic farming. Always give practical, specific, actionable advice suited for Indian farming conditions and climate. Respond ONLY in ${langName}. ${profileInfo} Use the farmer's profile to personalize every answer. Suggest relevant government schemes whenever applicable. Keep answers clear, simple, and practical. NEVER recommend banned pesticides: Endosulfan, Monocrotophos, Methyl Parathion, Carbofuran, Phorate, Triazophos, Dimethoate.`;

    const claudeMessages = messages.slice(-10).map((m: any) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));

    if (claudeMessages.length === 0 || claudeMessages[0].role === "assistant") {
      claudeMessages.unshift({ role: "user", content: userMessage });
    }

    const data = await callClaude({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: claudeMessages,
    }, ANTHROPIC_API_KEY);

    let aiResponse = data?.content?.[0]?.text || "";
    if (!aiResponse) {
      throw new Error("Empty response from AI");
    }

    aiResponse = filterBannedPesticides(aiResponse);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    const langMap: Record<string, string> = {
      hi: "माफ करें, कृपया फिर से कोशिश करें।",
      kn: "ಕ್ಷಮಿಸಿ, ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      te: "క్షమించండి, దయచేసి మళ్ళీ ప్రయత్నించండి.",
      ta: "மன்னிக்கவும், மீண்டும் முயற்சிக்கவும்.",
      ml: "ക്ഷമിക്കുക, ദയവായി വീണ്ടും ശ്രമിക്കുക.",
    };
    return new Response(JSON.stringify({ error: "Sorry, please try again later." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
