import { useState } from "react";
import { Tractor, Phone, MapPin } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";

const sampleMachines = [
  { type: "Tractor (45 HP)", location: "Jaipur, Rajasthan", dates: "Available Now", price: 1500, contact: "98765-44444" },
  { type: "Rotavator", location: "Amritsar, Punjab", dates: "Dec 15 - Jan 30", price: 800, contact: "98765-55555" },
  { type: "Harvester Combine", location: "Bhopal, MP", dates: "Nov 1 - Dec 15", price: 5000, contact: "98765-66666" },
];

const MachinesSection = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Rent Out Machine", "Find Machine"]} active={tab} onChange={setTab} />

      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">🚜 List Your Machine</h3>
          <input className="input-farm" placeholder="Machine Type (e.g., Tractor, Harvester)" />
          <input className="input-farm" placeholder="Location" />
          <input className="input-farm" placeholder="Available Dates" />
          <input className="input-farm" placeholder="Price per Day (₹)" type="number" />
          <input className="input-farm" placeholder="Contact Number" type="tel" />
          <button className="w-full btn-primary-farm">Post Machine</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sampleMachines.map((m) => (
            <div key={m.contact} className="card-farm animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tractor className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{m.type}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {m.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">📅 {m.dates}</span>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">₹{m.price}/day</span>
              </div>
              <a href={`tel:${m.contact}`} className="btn-primary-farm text-sm flex items-center justify-center gap-2 w-full">
                <Phone className="w-4 h-4" /> Contact Owner
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MachinesSection;
