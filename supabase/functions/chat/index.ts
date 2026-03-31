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
    const body = await req.json();
    console.log("Received body keys:", Object.keys(body));
    
    const { messages, language, profile } = body;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY is missing");
      throw new Error("API key not configured");
    }

    const langMap: Record<string, string> = {
      hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English",
    };
    const langName = langMap[language] || "English";

    const profileInfo = profile
      ? `Farmer Profile: Name: ${profile.name || "Farmer"}, Village: ${profile.village || "Unknown"}, District: ${profile.district || "Unknown"}, State: ${profile.state || "Unknown"}, Farm Size: ${profile.farmSize || "Unknown"} acres, Main Crops: ${profile.crops || "General"}.`
      : "";

    const systemPrompt = `You are KisanAI, India's smartest AI farming assistant. You have deep knowledge of all Indian crops, soil types, pest control, irrigation, harvesting, and government agricultural schemes. Always give practical, actionable advice for Indian farming. Respond ONLY in ${langName}. ${profileInfo}`;

    // Build clean messages array - ensure alternating user/assistant
    const cleanMessages: Array<{role: string; content: string}> = [];
    
    if (messages && Array.isArray(messages)) {
      for (const m of messages.slice(-10)) {
        const role = m.role === "assistant" ? "assistant" : "user";
        const content = typeof m.content === "string" ? m.content : String(m.content);
        if (content.trim()) {
          // Ensure we don't have consecutive same-role messages
          if (cleanMessages.length > 0 && cleanMessages[cleanMessages.length - 1].role === role) {
            cleanMessages[cleanMessages.length - 1].content += "\n" + content;
          } else {
            cleanMessages.push({ role, content });
          }
        }
      }
    }

    // Ensure first message is from user
    if (cleanMessages.length === 0) {
      cleanMessages.push({ role: "user", content: "Hello" });
    } else if (cleanMessages[0].role !== "user") {
      cleanMessages.unshift({ role: "user", content: "Hello" });
    }

    console.log("Sending to Claude:", cleanMessages.length, "messages, first role:", cleanMessages[0].role);

    // 1 second delay
    await new Promise((r) => setTimeout(r, 1000));

    const requestBody = {
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: cleanMessages,
    };

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (resp.status === 429) {
      console.warn("Rate limited, retrying in 3s...");
      await new Promise((r) => setTimeout(r, 3000));
      const retryResp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!retryResp.ok) {
        const t = await retryResp.text();
        console.error("Retry failed:", retryResp.status, t);
        throw new Error("API retry failed");
      }
      const data = await retryResp.json();
      const aiResponse = data?.content?.[0]?.text || "Sorry, please try again.";
      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("Claude API error:", resp.status, errorText);
      throw new Error(`Claude API error: ${resp.status}`);
    }

    const data = await resp.json();
    const aiResponse = data?.content?.[0]?.text;

    if (!aiResponse) {
      console.error("Empty response from Claude, full data:", JSON.stringify(data));
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
