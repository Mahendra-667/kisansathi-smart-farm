import { useState } from "react";
import { Camera, AlertTriangle, Pill, MapPin, Upload } from "lucide-react";
import { motion } from "framer-motion";

const DiseaseCheckSection = () => {
  const [result, setResult] = useState(false);

  const handleUpload = () => {
    setTimeout(() => setResult(true), 1000);
  };

  return (
    <div className="space-y-4">
      {!result ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card-farm flex flex-col items-center py-12 gap-4"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Upload Crop Photo</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Take a clear photo of the affected leaf or crop for AI-powered disease detection
          </p>
          <button onClick={handleUpload} className="btn-primary-farm flex items-center gap-2 mt-2">
            <Upload className="w-4 h-4" /> Upload Photo
          </button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card-farm border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-extrabold text-foreground">Late Blight (Phytophthora infestans)</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This disease occurs due to high humidity (above 80%) and cool temperatures (10-25°C). Infected leaves show dark brown/black water-soaked lesions with white mold on the underside. Spreads rapidly through wind and rain splashes.
            </p>
          </div>

          <div className="card-farm">
            <div className="flex items-center gap-2 mb-3">
              <Pill className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Recommended Medicine</h3>
            </div>
            <ul className="space-y-2 text-sm">
              {[
                "Mancozeb 75% WP — 2.5g/L spray",
                "Metalaxyl + Mancozeb (Ridomil Gold) — 2g/L",
                "Copper Oxychloride 50% WP — 3g/L",
                "Cymoxanil 8% + Mancozeb 64% — 3g/L",
              ].map((m) => (
                <li key={m} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span className="text-foreground">{m}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card-farm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">Nearest Pesticide Shops</h3>
            </div>
            <div className="space-y-3">
              {[
                { name: "Kisan Agro Centre", dist: "1.2 km", phone: "98765-43210" },
                { name: "Sharma Pesticides", dist: "2.5 km", phone: "98765-12345" },
                { name: "Green Farm Supply", dist: "3.8 km", phone: "98765-67890" },
              ].map((shop) => (
                <div key={shop.name} className="flex items-center justify-between bg-secondary rounded-lg px-3 py-2.5">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{shop.name}</p>
                    <p className="text-xs text-muted-foreground">{shop.dist} away</p>
                  </div>
                  <a href={`tel:${shop.phone}`} className="text-xs font-bold text-primary">
                    📞 {shop.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setResult(false)} className="w-full btn-primary-farm">
            Check Another Crop
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default DiseaseCheckSection;
