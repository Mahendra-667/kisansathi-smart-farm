import { useState, useEffect } from "react";
import { Tractor, Phone, MapPin, Loader2 } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const MachinesSection = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ machine_type: "", location: "", available_dates: "", price_per_day: "", contact: "" });

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase.from("machine_listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { if (tab === 1) fetchListings(); }, [tab]);

  const handlePost = async () => {
    if (!form.machine_type || !form.location || !form.available_dates || !form.price_per_day || !form.contact) {
      toast.error("Please fill all fields"); return;
    }
    setPosting(true);
    const { error } = await supabase.from("machine_listings").insert({
      user_id: user!.id, machine_type: form.machine_type, location: form.location,
      available_dates: form.available_dates, price_per_day: Number(form.price_per_day), contact: form.contact,
    });
    if (error) toast.error(error.message);
    else { toast.success("Machine posted!"); setForm({ machine_type: "", location: "", available_dates: "", price_per_day: "", contact: "" }); setTab(1); }
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Rent Out Machine", "Find Machine"]} active={tab} onChange={setTab} />
      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">🚜 List Your Machine</h3>
          <input className="input-farm" placeholder="Machine Type (e.g., Tractor, Harvester)" value={form.machine_type} onChange={e => setForm({ ...form, machine_type: e.target.value })} />
          <input className="input-farm" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input-farm" placeholder="Available Dates" value={form.available_dates} onChange={e => setForm({ ...form, available_dates: e.target.value })} />
          <input className="input-farm" placeholder="Price per Day (₹)" type="number" value={form.price_per_day} onChange={e => setForm({ ...form, price_per_day: e.target.value })} />
          <input className="input-farm" placeholder="Contact Number" type="tel" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          <button onClick={handlePost} disabled={posting} className="w-full btn-primary-farm flex items-center justify-center gap-2">
            {posting && <Loader2 className="w-4 h-4 animate-spin" />} Post Machine
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No machines listed yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {listings.map((m) => (
            <div key={m.id} className="card-farm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Tractor className="w-5 h-5 text-primary" /></div>
                <div>
                  <h4 className="font-bold text-foreground text-sm">{m.machine_type}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {m.location}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground">📅 {m.available_dates}</span>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">₹{Number(m.price_per_day).toLocaleString()}/day</span>
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
