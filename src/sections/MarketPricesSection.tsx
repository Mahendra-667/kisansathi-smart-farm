import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Search, Loader2, Lightbulb, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";

interface PriceRecord {
  commodity: string;
  market: string;
  state: string;
  min_price: string;
  max_price: string;
  modal_price: string;
}

const CATEGORIES: Record<string, string[]> = {
  All: [],
  Grains: ["Wheat", "Rice", "Maize", "Bajra", "Jowar", "Ragi", "Barley"],
  Vegetables: ["Onion", "Tomato", "Potato", "Green Chilli", "Brinjal", "Cauliflower", "Cabbage", "Okra", "Carrot", "Beans"],
  Fruits: ["Banana", "Mango", "Apple", "Grapes", "Orange", "Papaya", "Guava", "Pomegranate", "Watermelon"],
  Pulses: ["Chana", "Moong", "Urad", "Masoor", "Arhar", "Lentil"],
  Spices: ["Turmeric", "Cumin", "Coriander", "Black Pepper", "Cardamom", "Ginger", "Garlic"],
  Flowers: ["Marigold", "Rose", "Jasmine", "Chrysanthemum"],
};

const STATES = [
  "All States", "Andhra Pradesh", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Odisha", "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const MarketPricesSection = () => {
  const { lang } = useLanguage();
  const [records, setRecords] = useState<PriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [aiInsight, setAiInsight] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const state = selectedState === "All States" ? "" : selectedState;
      const { data, error } = await supabase.functions.invoke("market-prices", {
        body: { state, language: lang },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecords(data.records || []);
      setIsLive(data.isLive || false);
      setAiInsight(data.aiInsight || "");
    } catch (err: any) {
      toast.error("Could not load prices");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrices(); }, [selectedState, lang]);

  const filtered = records.filter((r) => {
    const matchSearch = !search || r.commodity?.toLowerCase().includes(search.toLowerCase()) || r.market?.toLowerCase().includes(search.toLowerCase());
    const catCrops = CATEGORIES[selectedCategory];
    const matchCat = !catCrops || catCrops.length === 0 || catCrops.some(c => r.commodity?.toLowerCase().includes(c.toLowerCase()));
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* State Selector */}
      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="w-full bg-card border border-border rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground outline-none"
      >
        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(CATEGORIES).map(cat => (
          <button key={cat} onClick={() => setSelectedCategory(cat)}
            className={`text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${
              selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search crop or market..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </div>

      {/* Status */}
      {!isLive && !loading && (
        <p className="text-xs text-muted-foreground text-center bg-yellow-50 dark:bg-yellow-950 rounded-lg py-1.5">
          ⚠️ Showing estimated prices. Live data may be temporarily unavailable.
        </p>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-sm text-muted-foreground">Loading prices...</span>
        </div>
      ) : (
        <div className="card-farm p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary text-primary-foreground">
                  <th className="text-left px-3 py-2.5 font-bold">Crop</th>
                  <th className="text-right px-2 py-2.5 font-bold text-xs">Min ₹</th>
                  <th className="text-right px-2 py-2.5 font-bold text-xs">Max ₹</th>
                  <th className="text-right px-3 py-2.5 font-bold text-xs">Modal ₹</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-6 text-muted-foreground text-sm">No prices found</td></tr>
                ) : filtered.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-foreground text-xs">{r.commodity}</p>
                      <p className="text-[10px] text-muted-foreground">{r.market}</p>
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs text-muted-foreground">₹{Number(r.min_price).toLocaleString()}</td>
                    <td className="px-2 py-2.5 text-right text-xs text-muted-foreground">₹{Number(r.max_price).toLocaleString()}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-foreground text-xs">₹{Number(r.modal_price).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insight */}
      {aiInsight && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-farm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-foreground text-sm">🤖 AI Market Insight</h3>
          </div>
          <div className="prose prose-sm max-w-none text-sm text-muted-foreground">
            <ReactMarkdown>{aiInsight}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MarketPricesSection;
