import { useState, useEffect } from "react";
import { MapPin, Phone, Loader2 } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LandConnectSection = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ location: "", acres: "", crop_type: "", rent_amount: "", contact: "" });

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase.from("land_listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { if (tab === 1) fetchListings(); }, [tab]);

  const handlePost = async () => {
    if (!form.location || !form.acres || !form.crop_type || !form.rent_amount || !form.contact) {
      toast.error("Please fill all fields"); return;
    }
    setPosting(true);
    const { error } = await supabase.from("land_listings").insert({
      user_id: user!.id, location: form.location, acres: Number(form.acres),
      crop_type: form.crop_type, rent_amount: Number(form.rent_amount), contact: form.contact,
    });
    if (error) toast.error(error.message);
    else { toast.success("Land posted!"); setForm({ location: "", acres: "", crop_type: "", rent_amount: "", contact: "" }); setTab(1); }
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Post My Land", "Find Land"]} active={tab} onChange={setTab} />
      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">📋 Post Your Land</h3>
          <input className="input-farm" placeholder="Location (Village, District)" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input-farm" placeholder="Area (in Acres)" type="number" value={form.acres} onChange={e => setForm({ ...form, acres: e.target.value })} />
          <input className="input-farm" placeholder="Suitable Crop Type" value={form.crop_type} onChange={e => setForm({ ...form, crop_type: e.target.value })} />
          <input className="input-farm" placeholder="Rent Amount (₹/month)" type="number" value={form.rent_amount} onChange={e => setForm({ ...form, rent_amount: e.target.value })} />
          <input className="input-farm" placeholder="Contact Number" type="tel" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          <button onClick={handlePost} disabled={posting} className="w-full btn-primary-farm flex items-center justify-center gap-2">
            {posting && <Loader2 className="w-4 h-4 animate-spin" />} Post Land
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No land listings yet. Be the first to post!</p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="card-farm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-foreground">{l.acres} Acres</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location}</p>
                </div>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">₹{Number(l.rent_amount).toLocaleString()}/mo</span>
              </div>
              <p className="text-sm text-foreground mb-3">Suitable for: <strong>{l.crop_type}</strong></p>
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
