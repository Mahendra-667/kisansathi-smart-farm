import { useState } from "react";
import { Upload, Leaf, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const organicTips = [
  { title: "Vermicomposting", desc: "Use earthworms to convert farm waste into nutrient-rich compost. 1 kg worms can process 5 kg waste/week." },
  { title: "Green Manuring", desc: "Grow dhaincha or sunhemp and plough it into soil before flowering. Adds 20-25 kg nitrogen/hectare." },
  { title: "Crop Rotation", desc: "Alternate cereals with legumes to naturally fix nitrogen and break pest cycles." },
  { title: "Neem Cake Application", desc: "Apply 250 kg/hectare neem cake to control soil pests and add organic nutrients." },
  { title: "Mulching", desc: "Cover soil with straw or leaves to retain moisture, suppress weeds, and regulate temperature." },
];

const SoilHealthSection = () => {
  const [uploaded, setUploaded] = useState(false);

  return (
    <div className="space-y-4">
      <div className="card-farm flex flex-col items-center py-8 gap-3">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-bold text-foreground">Upload Soil Test Report</h3>
        <p className="text-xs text-muted-foreground text-center">Upload your soil test report (PDF/Image) for AI analysis</p>
        <button onClick={() => setUploaded(true)} className="btn-primary-farm text-sm">
          Upload Report
        </button>
      </div>

      {uploaded && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card-farm">
          <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-primary" /> AI Soil Recommendations
          </h3>
          <div className="space-y-2 text-sm">
            <div className="bg-secondary rounded-lg p-3">
              <p className="font-semibold text-foreground">pH Level: 6.2 (Slightly Acidic)</p>
              <p className="text-muted-foreground">Apply 2 quintal lime/hectare to bring pH to optimal 6.5-7.0 range.</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="font-semibold text-foreground">Nitrogen: Low (180 kg/ha)</p>
              <p className="text-muted-foreground">Apply Urea at 100 kg/hectare in split doses. Consider green manuring with dhaincha.</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="font-semibold text-foreground">Phosphorus: Medium (22 kg/ha)</p>
              <p className="text-muted-foreground">Apply DAP at 50 kg/hectare at sowing time.</p>
            </div>
            <div className="bg-secondary rounded-lg p-3">
              <p className="font-semibold text-foreground">Organic Carbon: 0.4% (Low)</p>
              <p className="text-muted-foreground">Add 5 tonnes FYM/hectare and practice crop residue management.</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="card-farm">
        <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-accent" /> Organic Farming Tips
        </h3>
        <div className="space-y-3">
          {organicTips.map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <div>
                <p className="font-bold text-sm text-foreground">{tip.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SoilHealthSection;
