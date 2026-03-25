import { useState } from "react";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";

const sampleJobs = [
  { type: "Harvesting", date: "Dec 20, 2025", location: "Pune, Maharashtra", workers: 8, wage: 500 },
  { type: "Planting", date: "Jan 5, 2026", location: "Karnal, Haryana", workers: 12, wage: 450 },
  { type: "Weeding", date: "Dec 28, 2025", location: "Mysore, Karnataka", workers: 5, wage: 400 },
];

const FarmWorkSection = () => {
  const [tab, setTab] = useState(0);

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Post Work", "Find Work"]} active={tab} onChange={setTab} />

      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">👷 Post Farm Work</h3>
          <select className="input-farm">
            <option value="">Select Work Type</option>
            <option>Harvesting</option>
            <option>Planting</option>
            <option>Weeding</option>
            <option>Spraying</option>
            <option>Irrigation</option>
          </select>
          <input className="input-farm" placeholder="Date" type="date" />
          <input className="input-farm" placeholder="Location" />
          <input className="input-farm" placeholder="Number of Workers Needed" type="number" />
          <input className="input-farm" placeholder="Wage per Day (₹)" type="number" />
          <button className="w-full btn-primary-farm">Post Work</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sampleJobs.map((j, i) => (
            <div key={i} className="card-farm animate-fade-in">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{j.type}</h4>
                  <span className="bg-accent/20 text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">₹{j.wage}/day</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {j.date}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {j.workers} needed</span>
              </div>
              <button className="w-full btn-primary-farm text-sm">Apply Now</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FarmWorkSection;
