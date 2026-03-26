import { useState, useEffect } from "react";
import { Briefcase, MapPin, Calendar, Users, Loader2 } from "lucide-react";
import TabSwitch from "@/components/TabSwitch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const FarmWorkSection = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [form, setForm] = useState({ work_type: "", work_date: "", location: "", workers_needed: "", wage_per_day: "" });

  const fetchJobs = async () => {
    setLoading(true);
    const { data } = await supabase.from("farm_jobs").select("*").order("created_at", { ascending: false });
    setJobs(data || []);
    setLoading(false);
  };

  useEffect(() => { if (tab === 1) fetchJobs(); }, [tab]);

  const handlePost = async () => {
    if (!form.work_type || !form.work_date || !form.location || !form.workers_needed || !form.wage_per_day) {
      toast.error("Please fill all fields"); return;
    }
    setPosting(true);
    const { error } = await supabase.from("farm_jobs").insert({
      user_id: user!.id, work_type: form.work_type, work_date: form.work_date,
      location: form.location, workers_needed: Number(form.workers_needed), wage_per_day: Number(form.wage_per_day),
    });
    if (error) toast.error(error.message);
    else { toast.success("Work posted!"); setForm({ work_type: "", work_date: "", location: "", workers_needed: "", wage_per_day: "" }); setTab(1); }
    setPosting(false);
  };

  return (
    <div className="space-y-4">
      <TabSwitch tabs={["Post Work", "Find Work"]} active={tab} onChange={setTab} />
      {tab === 0 ? (
        <div className="card-farm space-y-3">
          <h3 className="font-bold text-foreground">👷 Post Farm Work</h3>
          <select className="input-farm" value={form.work_type} onChange={e => setForm({ ...form, work_type: e.target.value })}>
            <option value="">Select Work Type</option>
            <option>Harvesting</option>
            <option>Planting</option>
            <option>Weeding</option>
            <option>Spraying</option>
            <option>Irrigation</option>
          </select>
          <input className="input-farm" placeholder="Date" type="date" value={form.work_date} onChange={e => setForm({ ...form, work_date: e.target.value })} />
          <input className="input-farm" placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
          <input className="input-farm" placeholder="Number of Workers Needed" type="number" value={form.workers_needed} onChange={e => setForm({ ...form, workers_needed: e.target.value })} />
          <input className="input-farm" placeholder="Wage per Day (₹)" type="number" value={form.wage_per_day} onChange={e => setForm({ ...form, wage_per_day: e.target.value })} />
          <button onClick={handlePost} disabled={posting} className="w-full btn-primary-farm flex items-center justify-center gap-2">
            {posting && <Loader2 className="w-4 h-4 animate-spin" />} Post Work
          </button>
        </div>
      ) : loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No farm work posted yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <div key={j.id} className="card-farm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Briefcase className="w-5 h-5 text-primary" /></div>
                <div>
                  <h4 className="font-bold text-foreground">{j.work_type}</h4>
                  <span className="bg-accent/20 text-accent-foreground text-xs font-bold px-2 py-0.5 rounded">₹{Number(j.wage_per_day).toLocaleString()}/day</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(j.work_date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {j.location}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {j.workers_needed} needed</span>
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
