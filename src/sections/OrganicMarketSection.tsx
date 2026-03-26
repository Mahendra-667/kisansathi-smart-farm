import { useState, useEffect } from "react";
import { ShoppingBag, Phone, MapPin, ImagePlus, Loader2 } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const OrganicMarketSection = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ product_name: "", quantity: "", price: "", location: "", contact: "" });

  const fetchListings = async () => {
    setLoading(true);
    const { data } = await supabase.from("organic_listings").select("*").order("created_at", { ascending: false });
    setListings(data || []);
    setLoading(false);
  };

  useEffect(() => { if (tab === 1) fetchListings(); }, [tab]);

  const handlePost = async () => {
    if (!form.product_name || !form.quantity || !form.price || !form.location || !form.contact) {
      toast.error("Please fill all fields"); return;
    }
    setPosting(true);
    const { error } = await supabase.from("organic_listings").insert({
      user_id: user!.id, product_name: form.product_name, quantity: form.quantity,
      price: Number(form.price), location: form.location, contact: form.contact,
    });
    if (error) toast.error(error.message);
    else { toast.success("Product posted!"); setForm({ product_name: "", quantity: "", price: "", location: "", contact: "" }); setTab(1); }
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Post Product", "Browse Market"]} active={tab} onChange={setTab} />
      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">🌿 Post Organic Product</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center gap-2 bg-secondary/50">
            <ImagePlus className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Upload Product Photo</span>
          </div>
          <input className="input-farm" placeholder="Product Name (e.g., Gobar, Compost)" value={form.product_name} onChange={e => setForm({ ...form, product_name: e.target.value })} />
          <input className="input-farm" placeholder="Quantity (e.g., 50 kg)" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
          <input className="input-farm" placeholder="Price (₹)" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
          <input className="input-farm" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input-farm" placeholder="Contact Number" type="tel" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
          <button onClick={handlePost} disabled={posting} className="w-full btn-primary-farm flex items-center justify-center gap-2">
            {posting && <Loader2 className="w-4 h-4 animate-spin" />} Post Product
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : listings.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No products listed yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <div key={l.id} className="card-farm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingBag className="w-6 h-6 text-primary" /></div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">{l.product_name}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {l.location}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Qty: <strong className="text-foreground">{l.quantity}</strong></span>
                <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded-md">₹{Number(l.price).toLocaleString()}</span>
              </div>
              <a href={`tel:${l.contact}`} className="btn-primary-farm text-sm flex items-center justify-center gap-2 w-full">
                <Phone className="w-4 h-4" /> Call Seller
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrganicMarketSection;
