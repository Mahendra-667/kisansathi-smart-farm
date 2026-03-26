import { Home, Camera, TrendingUp, MapPin, Tractor, Briefcase, Leaf, ShoppingBag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const tabIcons: Record<string, typeof Home> = {
  home: Home, disease: Camera, market: TrendingUp, land: MapPin,
  machines: Tractor, work: Briefcase, soil: Leaf, organic: ShoppingBag,
};

const tabOrder = ["home", "disease", "market", "land", "machines", "work", "soil", "organic"];

interface BottomNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const BottomNav = ({ active, onNavigate }: BottomNavProps) => {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-4 gap-0">
        {tabOrder.map((id) => {
          const Icon = tabIcons[id];
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex flex-col items-center py-2 px-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
              <span className="text-[10px] mt-0.5 font-semibold leading-tight">{t.navLabels[id]}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
