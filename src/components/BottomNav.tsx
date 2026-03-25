import { Home, Camera, TrendingUp, MapPin, Tractor, Briefcase, Leaf, ShoppingBag } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "disease", label: "Disease", icon: Camera },
  { id: "market", label: "Market", icon: TrendingUp },
  { id: "land", label: "Land", icon: MapPin },
  { id: "machines", label: "Machines", icon: Tractor },
  { id: "work", label: "Work", icon: Briefcase },
  { id: "soil", label: "Soil", icon: Leaf },
  { id: "organic", label: "Organic", icon: ShoppingBag },
];

interface BottomNavProps {
  active: string;
  onNavigate: (id: string) => void;
}

const BottomNav = ({ active, onNavigate }: BottomNavProps) => (
  <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
    <div className="grid grid-cols-4 gap-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.id)}
            className={`flex flex-col items-center py-2 px-1 transition-colors ${
              isActive ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : ""}`} />
            <span className="text-[10px] mt-0.5 font-semibold leading-tight">{tab.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export default BottomNav;
