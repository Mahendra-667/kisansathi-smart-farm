import { useState } from "react";
import { MapPin, Phone } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";

const sampleListings = [
  { location: "Nashik, Maharashtra", acres: 5, crop: "Sugarcane", rent: 15000, contact: "98765-11111" },
  { location: "Ludhiana, Punjab", acres: 10, crop: "Wheat/Rice", rent: 22000, contact: "98765-22222" },
  { location: "Indore, MP", acres: 3, crop: "Soybean", rent: 8000, contact: "98765-33333" },
];

const LandConnectSection = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Post My Land", "Find Land"]} active={tab} onChange={setTab} />

      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">📋 Post Your Land</h3>
          <input className="input-farm" placeholder="Location (Village, District)" />
          <input className="input-farm" placeholder="Area (in Acres)" type="number" />
          <input className="input-farm" placeholder="Suitable Crop Type" />
          <input className="input-farm" placeholder="Rent Amount (₹/month)" type="number" />
          <input className="input-farm" placeholder="Contact Number" type="tel" />
          <button className="w-full btn-primary-farm">Post Land</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sampleListings.map((l) => (
            <div key={l.contact} className="card-farm animate-fade-in">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{l.acres} Acres</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {l.location}
                  </p>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
                  ₹{l.rent.toLocaleString()}/mo
                </span>
              </div>
              <p className="text-sm text-foreground mb-3">Suitable for: <strong>{l.crop}</strong></p>
              <a href={`tel:${l.contact}`} className="btn-primary-farm text-sm flex items-center justify-center gap-2 w-full">
                <Phone className="w-4 h-4" /> Call Owner
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LandConnectSection;
