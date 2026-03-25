import { useState } from "react";
import { ShoppingBag, Phone, MapPin, ImagePlus } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";

const sampleListings = [
  { item: "Cow Dung Compost (गोबर खाद)", qty: "50 kg", price: 500, location: "Varanasi, UP", contact: "98765-77777" },
  { item: "Vermicompost", qty: "100 kg", price: 1200, location: "Nagpur, Maharashtra", contact: "98765-88888" },
  { item: "Neem Cake", qty: "25 kg", price: 750, location: "Hyderabad, Telangana", contact: "98765-99999" },
  { item: "Bio Fertilizer Mix", qty: "20 L", price: 400, location: "Coimbatore, TN", contact: "98765-00000" },
];

const OrganicMarketSection = () => {
  const [tab, setTab] = useState(0);

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
          <input className="input-farm" placeholder="Product Name (e.g., Gobar, Compost)" />
          <input className="input-farm" placeholder="Quantity (e.g., 50 kg)" />
          <input className="input-farm" placeholder="Price (₹)" type="number" />
          <input className="input-farm" placeholder="Location" />
          <input className="input-farm" placeholder="Contact Number" type="tel" />
          <button className="w-full btn-primary-farm">Post Product</button>
        </div>
      ) : (
        <div className="space-y-3">
          {sampleListings.map((l) => (
            <div key={l.contact} className="card-farm animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm text-foreground">{l.item}</h4>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {l.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Qty: <strong className="text-foreground">{l.qty}</strong></span>
                <span className="bg-primary/10 text-primary text-sm font-bold px-2 py-1 rounded-md">₹{l.price}</span>
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
