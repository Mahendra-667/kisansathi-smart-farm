import { useState, useRef, useEffect } from "react";
import { Camera, AlertTriangle, Pill, Shield, Upload, Loader2, Leaf, RefreshCw, History, MapPin, Phone, MessageCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface MedicineInfo {
  name: string;
  dosage: string;
  how_to_apply?: string;
}

interface DiagnosisResult {
  disease_name: string;
  severity: string;
  cause: string;
  immediate_action?: string;
  symptoms: string[];
  medicines: MedicineInfo[];
  precautions: string[];
  organic_alternatives: string[];
  recovery_time?: string;
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
  const { lang } = useLanguage();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<SavedResult[]>([]);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setGpsCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setGpsCoords({ lat: 28.6139, lng: 77.209 })
      );
    }
  }, []);

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
        immediate_action: "",
        symptoms: (d.symptoms as string[]) || [],
        medicines: (d.medicines as MedicineInfo[]) || [],
        precautions: (d.precautions as string[]) || [],
        organic_alternatives: (d.organic_alternatives as string[]) || [],
        raw: d.raw_response || undefined,
      })));
    }
  };

  useEffect(() => { if (showHistory) loadHistory(); }, [showHistory]);

  const saveResult = async (res: DiagnosisResult) => {
    if (!user) return;
    await supabase.from("disease_results").insert([{
      user_id: user.id,
      disease_name: res.disease_name,
      severity: res.severity,
      cause: res.cause,
      symptoms: res.symptoms as any,
      medicines: res.medicines as any,
      precautions: res.precautions as any,
      organic_alternatives: res.organic_alternatives as any,
      raw_response: res.raw || null,
    }]);
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
        const { data, error } = await supabase.functions.invoke("disease-check", {
          body: { imageBase64: base64, language: lang },
        });
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

  const openPesticideShop = () => {
    const lat = gpsCoords?.lat || 28.6139;
    const lng = gpsCoords?.lng || 77.209;
    window.open(`https://www.google.com/maps/search/pesticide+shop/@${lat},${lng},13z`, "_blank");
  };

  const callHelpline = () => {
    window.open("tel:18001801551", "_self");
  };

  const whatsappExpert = () => {
    const msg = result ? `I found ${result.disease_name} on my crop. Severity: ${result.severity}. Can you help?` : "I need help with crop disease.";
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const renderResult = (res: DiagnosisResult, showImage = true, showActions = true) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {showImage && preview && <img src={preview} alt="Crop" className="w-full h-40 rounded-xl object-cover" />}
      {res.raw ? (
        <div className="card-farm"><p className="text-sm text-foreground whitespace-pre-wrap">{res.raw}</p></div>
      ) : (
        <>
          {/* Disease Name & Severity */}
          <div className="card-farm border-l-4 border-l-destructive">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <h3 className="text-lg font-extrabold text-destructive">{res.disease_name}</h3>
            </div>
            {res.severity && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severityColor[res.severity] || "text-muted-foreground bg-muted"}`}>
                {res.severity.toUpperCase()} SEVERITY
              </span>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed mt-2"><strong>Why it happened:</strong> {res.cause}</p>
            {res.immediate_action && (
              <div className="mt-2 bg-red-50 dark:bg-red-950 rounded-lg p-2.5">
                <p className="text-sm font-bold text-destructive">⚡ Immediate Action: {res.immediate_action}</p>
              </div>
            )}
          </div>

          {/* Symptoms */}
          {res.symptoms?.length > 0 && (
            <div className="card-farm">
              <h4 className="font-bold text-foreground mb-2">🔍 Symptoms</h4>
              <ul className="space-y-1">
                {res.symptoms.map((s, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicine */}
          {res.medicines?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Pill className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">💊 Medicine & Dosage</h3></div>
              <div className="space-y-3">
                {res.medicines.map((m, i) => (
                  <div key={i} className="bg-secondary rounded-lg p-3">
                    <p className="font-bold text-foreground text-sm">{m.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">📏 Dosage: {m.dosage}</p>
                    {m.how_to_apply && <p className="text-xs text-muted-foreground mt-1">📋 How to apply: {m.how_to_apply}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recovery Time */}
          {res.recovery_time && (
            <div className="card-farm flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Recovery Time: {res.recovery_time}</p>
            </div>
          )}

          {/* Organic Alternatives */}
          {res.organic_alternatives?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Leaf className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">🌿 Organic Alternatives</h3></div>
              <ul className="space-y-2 text-sm">
                {res.organic_alternatives.map((a, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span className="text-foreground">{a}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* Prevention */}
          {res.precautions?.length > 0 && (
            <div className="card-farm">
              <div className="flex items-center gap-2 mb-3"><Shield className="w-5 h-5 text-primary" /><h3 className="font-bold text-foreground">🛡️ Prevention Tips</h3></div>
              <ul className="space-y-2 text-sm">
                {res.precautions.map((p, i) => (
                  <li key={i} className="flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" /><span className="text-foreground">{p}</span></li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="space-y-2">
              <button onClick={openPesticideShop} className="w-full btn-primary-farm flex items-center justify-center gap-2 text-sm">
                <MapPin className="w-4 h-4" /> Find Pesticide Shop Nearby
              </button>
              <button onClick={callHelpline} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors">
                <Phone className="w-4 h-4" /> Call Kisan Helpline 1800-180-1551
              </button>
              <button onClick={whatsappExpert} className="w-full flex items-center justify-center gap-2 text-sm font-bold py-2.5 px-4 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> WhatsApp Expert
              </button>
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
              {renderResult(h, false, false)}
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
