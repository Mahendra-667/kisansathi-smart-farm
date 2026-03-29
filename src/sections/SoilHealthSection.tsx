import { useState, useRef } from "react";
import { Upload, Leaf, Loader2, FileText, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import ReactMarkdown from "react-markdown";

interface SoilResult {
  soil_health_score?: string;
  score_explanation?: string;
  suitable_crops?: { crop: string; reason: string }[];
  organic_improvements?: { step: string; quantity: string; timing: string }[];
  fertilizer_recommendations?: { organic: any[]; chemical: any[] };
  irrigation_advice?: string;
  warning_signs?: string[];
  improvement_timeline?: string;
  raw?: string;
}

const SoilHealthSection = () => {
  const { lang } = useLanguage();
  const [result, setResult] = useState<SoilResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setImageBase64(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!description.trim() && !imageBase64) {
      toast.error("Please upload a soil photo or describe your soil");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("soil-analysis", {
        body: { description, imageBase64, language: lang },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to analyze soil");
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: string) => {
    const n = parseInt(score);
    if (n >= 7) return "text-green-600";
    if (n >= 4) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {!result && !loading && (
        <div className="space-y-4">
          <div className="card-farm flex flex-col items-center py-8 gap-3">
            {preview ? (
              <img src={preview} alt="Soil" className="w-32 h-32 rounded-xl object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="w-8 h-8 text-primary" />
              </div>
            )}
            <h3 className="font-bold text-foreground">Upload Soil Photo/Report</h3>
            <p className="text-xs text-muted-foreground text-center">Upload soil test report or photo for AI analysis</p>
            <button onClick={() => fileRef.current?.click()} className="btn-primary-farm text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" /> Upload Photo/Report
            </button>
          </div>

          <div className="card-farm space-y-3">
            <h4 className="font-bold text-foreground text-sm">Or Describe Your Soil</h4>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your soil type, color, texture, problems you're facing..."
              className="input-farm min-h-[100px] resize-none"
            />
            <button onClick={analyze} disabled={!description.trim() && !imageBase64}
              className="w-full btn-primary-farm flex items-center justify-center gap-2">
              <Send className="w-4 h-4" /> Analyze Soil
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="card-farm flex flex-col items-center py-12 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">Analyzing your soil...</p>
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {result.raw ? (
            <div className="card-farm prose prose-sm max-w-none">
              <ReactMarkdown>{result.raw}</ReactMarkdown>
            </div>
          ) : (
            <>
              {/* Score */}
              {result.soil_health_score && (
                <div className="card-farm text-center">
                  <p className="text-sm text-muted-foreground mb-1">Soil Health Score</p>
                  <p className={`text-4xl font-extrabold ${scoreColor(result.soil_health_score)}`}>
                    {result.soil_health_score}/10
                  </p>
                  {result.score_explanation && (
                    <p className="text-sm text-muted-foreground mt-2">{result.score_explanation}</p>
                  )}
                </div>
              )}

              {/* Suitable Crops */}
              {result.suitable_crops && result.suitable_crops.length > 0 && (
                <div className="card-farm">
                  <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-primary" /> Top Suitable Crops
                  </h4>
                  <div className="space-y-2">
                    {result.suitable_crops.map((c, i) => (
                      <div key={i} className="bg-secondary rounded-lg p-3">
                        <p className="font-bold text-foreground text-sm">{c.crop}</p>
                        <p className="text-xs text-muted-foreground">{c.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Organic Improvements */}
              {result.organic_improvements && result.organic_improvements.length > 0 && (
                <div className="card-farm">
                  <h4 className="font-bold text-foreground mb-3">🌱 Organic Improvement Steps</h4>
                  <div className="space-y-2">
                    {result.organic_improvements.map((s, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                        <div>
                          <p className="text-sm text-foreground font-semibold">{s.step}</p>
                          <p className="text-xs text-muted-foreground">📏 {s.quantity} • ⏰ {s.timing}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Irrigation */}
              {result.irrigation_advice && (
                <div className="card-farm">
                  <h4 className="font-bold text-foreground mb-2">💧 Irrigation Advice</h4>
                  <p className="text-sm text-muted-foreground">{result.irrigation_advice}</p>
                </div>
              )}

              {/* Warnings */}
              {result.warning_signs && result.warning_signs.length > 0 && (
                <div className="card-farm border-l-4 border-l-yellow-500">
                  <h4 className="font-bold text-foreground mb-2">⚠️ Warning Signs</h4>
                  <ul className="space-y-1">
                    {result.warning_signs.map((w, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />{w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Timeline */}
              {result.improvement_timeline && (
                <div className="card-farm flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Timeline: {result.improvement_timeline}</p>
                </div>
              )}
            </>
          )}

          <button onClick={() => { setResult(null); setPreview(null); setImageBase64(null); setDescription(""); }}
            className="w-full btn-primary-farm">
            Analyze Another Soil
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SoilHealthSection;
