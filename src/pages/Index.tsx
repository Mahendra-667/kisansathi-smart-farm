import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import HomeSection from "@/sections/HomeSection";
import DiseaseCheckSection from "@/sections/DiseaseCheckSection";
import MarketPricesSection from "@/sections/MarketPricesSection";
import LandConnectSection from "@/sections/LandConnectSection";
import MachinesSection from "@/sections/MachinesSection";
import FarmWorkSection from "@/sections/FarmWorkSection";
import SoilHealthSection from "@/sections/SoilHealthSection";
import OrganicMarketSection from "@/sections/OrganicMarketSection";

const sectionTitles: Record<string, string> = {
  home: "🏠 AI Farming Assistant",
  disease: "🔬 Disease Check",
  market: "📈 Market Prices",
  land: "🌾 Land Connect",
  machines: "🚜 Farm Machines",
  work: "👷 Farm Work",
  soil: "🧪 Soil Health",
  organic: "🌿 Organic Market",
};

const Index = () => {
  const [active, setActive] = useState("home");

  const renderSection = () => {
    switch (active) {
      case "home": return <HomeSection />;
      case "disease": return <DiseaseCheckSection />;
      case "market": return <MarketPricesSection />;
      case "land": return <LandConnectSection />;
      case "machines": return <MachinesSection />;
      case "work": return <FarmWorkSection />;
      case "soil": return <SoilHealthSection />;
      case "organic": return <OrganicMarketSection />;
      default: return <HomeSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <main className="flex-1 px-4 py-4 pb-24 overflow-y-auto">
        <h2 className="text-lg font-extrabold text-foreground mb-4">{sectionTitles[active]}</h2>
        {renderSection()}
      </main>
      <BottomNav active={active} onNavigate={setActive} />
    </div>
  );
};

export default Index;
