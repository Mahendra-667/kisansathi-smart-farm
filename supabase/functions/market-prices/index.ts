import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const STATIC_PRICES = [
  { commodity: "Wheat", market: "Azadpur", state: "Delhi", min_price: "2100", max_price: "2400", modal_price: "2275" },
  { commodity: "Rice", market: "Koyambedu", state: "Tamil Nadu", min_price: "3600", max_price: "4100", modal_price: "3850" },
  { commodity: "Onion", market: "Lasalgaon", state: "Maharashtra", min_price: "1500", max_price: "2100", modal_price: "1800" },
  { commodity: "Tomato", market: "Kolar", state: "Karnataka", min_price: "1800", max_price: "2600", modal_price: "2200" },
  { commodity: "Potato", market: "Agra", state: "Uttar Pradesh", min_price: "1000", max_price: "1500", modal_price: "1250" },
  { commodity: "Cotton", market: "Rajkot", state: "Gujarat", min_price: "6200", max_price: "6800", modal_price: "6500" },
  { commodity: "Soybean", market: "Indore", state: "Madhya Pradesh", min_price: "4000", max_price: "4400", modal_price: "4200" },
  { commodity: "Sugarcane", market: "Muzaffarnagar", state: "Uttar Pradesh", min_price: "3000", max_price: "3300", modal_price: "3150" },
  { commodity: "Mustard", market: "Alwar", state: "Rajasthan", min_price: "4900", max_price: "5300", modal_price: "5100" },
  { commodity: "Chana", market: "Bikaner", state: "Rajasthan", min_price: "4600", max_price: "5000", modal_price: "4800" },
  { commodity: "Maize", market: "Davangere", state: "Karnataka", min_price: "1800", max_price: "2100", modal_price: "1962" },
  { commodity: "Bajra", market: "Jodhpur", state: "Rajasthan", min_price: "2200", max_price: "2500", modal_price: "2350" },
  { commodity: "Turmeric", market: "Erode", state: "Tamil Nadu", min_price: "12000", max_price: "14000", modal_price: "13000" },
  { commodity: "Green Chilli", market: "Guntur", state: "Andhra Pradesh", min_price: "2500", max_price: "3500", modal_price: "3000" },
  { commodity: "Banana", market: "Jalgaon", state: "Maharashtra", min_price: "800", max_price: "1200", modal_price: "1000" },
  { commodity: "Mango", market: "Ratnagiri", state: "Maharashtra", min_price: "3000", max_price: "5000", modal_price: "4000" },
  { commodity: "Coconut", market: "Kozhikode", state: "Kerala", min_price: "2500", max_price: "3200", modal_price: "2850" },
  { commodity: "Groundnut", market: "Junagadh", state: "Gujarat", min_price: "5200", max_price: "5800", modal_price: "5500" },
  { commodity: "Moong", market: "Jaipur", state: "Rajasthan", min_price: "7000", max_price: "7800", modal_price: "7400" },
  { commodity: "Urad", market: "Indore", state: "Madhya Pradesh", min_price: "6500", max_price: "7200", modal_price: "6850" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { state, language } = await req.json();
    const DATA_GOV_KEY = Deno.env.get("DATA_GOV_KEY");
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    let records: any[] = [];
    let isLive = false;

    if (DATA_GOV_KEY) {
      try {
        const stateFilter = state ? `&filters[state]=${encodeURIComponent(state)}` : "";
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_KEY}&format=json&limit=100${stateFilter}`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          if (data.records && data.records.length > 0) {
            records = data.records;
            isLive = true;
          }
        }
      } catch (e) {
        console.error("data.gov.in error:", e);
      }
    }

    if (!isLive) {
      records = state ? STATIC_PRICES.filter(p => p.state === state) : STATIC_PRICES;
      if (records.length === 0) records = STATIC_PRICES;
    }

    let aiInsight = "";
    if (GEMINI_API_KEY) {
      try {
        const langMap: Record<string, string> = {
          hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
        };
        const langName = langMap[language] || "English";
        const top5 = records.slice(0, 5).map((r: any) => `${r.commodity}: ₹${r.modal_price}`).join(", ");

        const prompt = `Based on current Indian mandi prices (${top5}), give a 2-3 sentence market insight for farmers. Include: which crop to sell now, price trend prediction, and best strategy. Respond in ${langName}.`;

        const geminiResp = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.5 },
            }),
          }
        );

        if (geminiResp.ok) {
          const geminiData = await geminiResp.json();
          aiInsight = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        }
      } catch (e) {
        console.error("Gemini insight error:", e);
      }
    }

    return new Response(JSON.stringify({ records, isLive, aiInsight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-prices error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
