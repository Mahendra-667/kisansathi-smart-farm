import { useState, useRef, useEffect } from "react";
import { Camera, AlertTriangle, Pill, Shield, Upload, Loader2, Leaf, RefreshCw, History } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DiagnosisResult {
  disease_name: string;
  severity: string;
  cause: string;
  symptoms: string[];
  medicines: { name: string; dosage: string }[];
  precautions: string[];
  organic_alternatives: string[];
  raw?: string;
}

interface SavedResult extends DiagnosisResult {
  id: string;
  created_at: string;
}

const severityColor: Record<string, string> = {
  low: "text-green-600 bg-green-100",
  medium: "text-yellow-600 bg-yellow-100",
  high: "text-orange-600 bg-orange-100",
  critical: "text-destructive bg-red-100",
};

const DiseaseCheckSection = () => {
  const { user } = useAuth();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedResult[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("disease_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) {
      setHistory(data.map((d: any) => ({
        id: d.id,
        created_at: d.created_at,
        disease_name: d.disease_name || "",
        severity: d.severity || "",
        cause: d.cause || "",
        symptoms: (d.symptoms as string[]) || [],
        medicines: (d.medicines as { name: string; dosage: string }[]) || [],
        precautions: (d.precautions as string[]) || [],
        organic_alternatives: (d.organic_alternatives as string[]) || [],
        raw: d.raw_response || undefined,
      })));
    }
  };

  useEffect(() => { if (showHistory) loadHistory(); }, [showHistory]);

  const saveResult = async (res: DiagnosisResult) => {
    if (!user) return;
    await supabase.from("disease_results").insert({
      user_id: user.id,
      disease_name: res.disease_name,
      severity: res.severity,
      cause: res.cause,
      symptoms: res.symptoms,
      medicines: res.medicines,
      precautions: res.precautions,
      organic_alternatives: res.organic_alternatives,
      raw_response: res.raw || null,
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Image must be under 10MB"); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setPreview(dataUrl);
      setLoading(true);
      const base64 = dataUrl.split(",")[1];
      try {
        const { data, error } = await supabase.functions.invoke("disease-check", { body: { imageBase64: base64 } });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setResult(data);
        await saveResult(data);
      } catch (err: any) {
        toast.error(err.message || "Failed to analyze image");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const reset = () => { setResult(null); setPreview(null); if (fileRef.current) fileRef.current.value = ""; };

  const renderResult = (res: DiagnosisResult, showImage = true) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {showImage && preview && <img src={preview} alt="Crop" className="w-full h-40 rounded-xl object-cover" />}
      {res.raw ? (
        <div className="card-farm"><p className="text-sm text-foreground whitespace-pre-wrap">{res.raw}</p></div>
      ) : (
        <>
          <div className="card-farm border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-extrabold text-foreground">{res.disease_name}</h3>
            </div>
            {res.severity && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColor[res.severity] || "text-muted-foreground bg-muted"}`}>
                {res.severity.toUpperCase()} SEVERITY
              </span>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">{res.cause}</p>
            {res.symptoms?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {res.symptoms.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {res.medicines?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">Recommended Medicine</h3></div>
              <ul className="space-y-2 text-sm">
                {res.medicines.map((m, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    <span className="text-foreground"><strong>{m.name}</strong> — {m.dosage}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {res.organic_alternatives?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Leaf className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">Organic Alternatives</h3></div>
              <ul className="space-y-2 text-sm">
                {res.organic_alternatives.map((a, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span className="text-foreground">{a}</span></li>
                ))}
              </ul>
            </div>
          )}
          {res.precautions?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">Precautions</h3></div>
              <ul className="space-y-2 text-sm">
                {res.precautions.map((p, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span className="text-foreground">{p}</span></li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </motion.div>
  );

  return (
    <div className="space-y-4">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      <div className="flex gap-2">
        <button onClick={() => setShowHistory(false)} className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors ${!showHistory ? "tab-active" : "tab-inactive"}`}>
          New Check
        </button>
        <button onClick={() => setShowHistory(true)} className={`text-sm font-bold px-4 py-1.5 rounded-full transition-colors flex items-center gap-1 ${showHistory ? "tab-active" : "tab-inactive"}`}>
          <History className="w-3.5 h-3.5" /> History
        </button>
      </div>

      {showHistory ? (
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No past disease checks yet</p>
          ) : history.map((h) => (
            <div key={h.id} className="space-y-2">
              <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
              {renderResult(h, false)}
            </div>
          ))}
        </div>
      ) : !result && !loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-farm flex flex-col items-center py-12 gap-4">
          {preview ? (
            <img src={preview} alt="Preview" className="w-32 h-32 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-12 h-12 text-primary" />
            </div>
          )}
          <h2 className="text-lg font-bold text-foreground">Upload Crop Photo</h2>
          <p className="text-sm text-muted-foreground text-center max-w-xs">Take a clear photo of the affected leaf or crop for AI-powered disease detection</p>
          <button onClick={() => fileRef.current?.click()} className="btn-primary-farm flex items-center gap-2 mt-2">
            <Upload className="w-4 h-4" /> Upload Photo
          </button>
        </motion.div>
      ) : loading ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-farm flex flex-col items-center py-12 gap-4">
          {preview && <img src={preview} alt="Analyzing" className="w-32 h-32 rounded-xl object-cover opacity-75" />}
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-sm font-semibold text-foreground">Analyzing your crop...</p>
        </motion.div>
      ) : result ? (
        <div className="space-y-4">
          {renderResult(result)}
          <button onClick={reset} className="w-full btn-primary-farm flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> Check Another Crop
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DiseaseCheckSection;
