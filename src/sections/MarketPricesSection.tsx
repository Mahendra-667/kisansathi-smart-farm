import { ArrowUp, ArrowDown } from "lucide-react";

const crops = [
  { name: "Wheat (गेहूं)", price: 2275, change: 45, up: true },
  { name: "Rice (चावल)", price: 3850, change: -30, up: false },
  { name: "Onion (प्याज)", price: 1800, change: 120, up: true },
  { name: "Tomato (टमाटर)", price: 2200, change: -180, up: false },
  { name: "Potato (आलू)", price: 1250, change: 35, up: true },
  { name: "Cotton (कपास)", price: 6500, change: 75, up: true },
  { name: "Soybean (सोयाबीन)", price: 4200, change: -55, up: false },
  { name: "Sugarcane (गन्ना)", price: 3150, change: 25, up: true },
  { name: "Mustard (सरसों)", price: 5100, change: 90, up: true },
  { name: "Chana (चना)", price: 4800, change: -40, up: false },
  { name: "Maize (मक्का)", price: 1962, change: 28, up: true },
  { name: "Bajra (बाजरा)", price: 2350, change: -15, up: false },
];

const MarketPricesSection = () => (
  <div className="space-y-3">
    <div className="card-farm">
      <h2 className="font-bold text-foreground mb-1">📊 Today's Mandi Prices</h2>
      <p className="text-xs text-muted-foreground mb-4">Updated: {new Date().toLocaleDateString("en-IN")}</p>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="text-left px-3 py-2.5 font-bold">Crop</th>
              <th className="text-right px-3 py-2.5 font-bold">₹/Quintal</th>
              <th className="text-right px-3 py-2.5 font-bold">Change</th>
            </tr>
          </thead>
          <tbody>
            {crops.map((crop, i) => (
              <tr key={crop.name} className={i % 2 === 0 ? "bg-card" : "bg-secondary/50"}>
                <td className="px-3 py-2.5 font-semibold text-foreground">{crop.name}</td>
                <td className="px-3 py-2.5 text-right font-bold text-foreground">₹{crop.price.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-right">
                  <span className={`inline-flex items-center gap-0.5 font-bold text-xs ${crop.up ? "text-success" : "text-danger"}`}>
                    {crop.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    ₹{Math.abs(crop.change)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default MarketPricesSection;
