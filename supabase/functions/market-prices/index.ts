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
  { commodity: "Arhar", market: "Latur", state: "Maharashtra", min_price: "6000", max_price: "6600", modal_price: "6300" },
  { commodity: "Jowar", market: "Solapur", state: "Maharashtra", min_price: "2600", max_price: "3000", modal_price: "2800" },
  { commodity: "Ragi", market: "Hassan", state: "Karnataka", min_price: "3200", max_price: "3600", modal_price: "3400" },
  { commodity: "Apple", market: "Shimla", state: "Himachal Pradesh", min_price: "4000", max_price: "6000", modal_price: "5000" },
  { commodity: "Pomegranate", market: "Solapur", state: "Maharashtra", min_price: "5000", max_price: "8000", modal_price: "6500" },
  { commodity: "Grapes", market: "Nashik", state: "Maharashtra", min_price: "3000", max_price: "5000", modal_price: "4000" },
  { commodity: "Ginger", market: "Cochin", state: "Kerala", min_price: "3500", max_price: "4500", modal_price: "4000" },
  { commodity: "Garlic", market: "Mandsaur", state: "Madhya Pradesh", min_price: "4000", max_price: "5500", modal_price: "4750" },
  { commodity: "Coriander", market: "Kota", state: "Rajasthan", min_price: "6000", max_price: "7000", modal_price: "6500" },
  { commodity: "Cumin", market: "Unjha", state: "Gujarat", min_price: "30000", max_price: "35000", modal_price: "32500" },
];

async function callClaude(body: any, apiKey: string): Promise<any> {
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
  if (!resp.ok) return null;
  return resp.json();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { state, language } = await req.json();
    const DATA_GOV_KEY = Deno.env.get("DATA_GOV_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

    let records: any[] = [];
    let isLive = false;

    if (DATA_GOV_KEY) {
      try {
        const stateFilter = state ? `&filters[state]=${encodeURIComponent(state)}` : "";
        const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${DATA_GOV_KEY}&format=json&limit=200${stateFilter}`;
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
    if (ANTHROPIC_API_KEY) {
      try {
        const langMap: Record<string, string> = {
          hi: "Hindi", kn: "Kannada", te: "Telugu", ta: "Tamil", ml: "Malayalam", en: "English"
        };
        const langName = langMap[language] || "English";
        const top5 = records.slice(0, 5).map((r: any) => `${r.commodity}: ₹${r.modal_price}`).join(", ");

        const prompt = `Based on current Indian mandi prices (${top5}), give market intelligence for farmers: 1) Best 3 crops to sell this week with reasons, 2) Price prediction next 7 days, 3) Best APMC market to visit, 4) Crops to avoid selling this week. Respond in ${langName}. Keep it concise.`;

        const data = await callClaude({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: "You are an Indian agricultural market analyst. Give practical market advice to farmers.",
          messages: [{ role: "user", content: prompt }],
        }, ANTHROPIC_API_KEY);

        if (data?.content?.[0]?.text) {
          aiInsight = data.content[0].text;
        }
      } catch (e) {
        console.error("Claude insight error:", e);
      }
    }

    return new Response(JSON.stringify({ records, isLive, aiInsight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("market-prices error:", e);
    return new Response(JSON.stringify({ error: "Could not load market prices." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
