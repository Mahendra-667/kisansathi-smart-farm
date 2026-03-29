import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import WeatherCard from "@/components/WeatherCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Scheme {
  name: string;
  benefit: string;
  eligibility: string[];
  how_to_apply: string[];
  website: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const HomeSection = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: t.welcome }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemesLoading, setSchemesLoading] = useState(false);
  const [expandedScheme, setExpandedScheme] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: t.welcome }];
      }
      return [{ role: "assistant", content: t.welcome }, ...prev.slice(1)];
    });
  }, [lang, t.welcome]);

  useEffect(() => {
    if (!user || historyLoaded) return;
    const load = async () => {
      const { data } = await supabase
        .from("chat_history")
        .select("role, content")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(100);
      if (data && data.length > 0) {
        setMessages([{ role: "assistant", content: t.welcome }, ...data.map(d => ({ role: d.role as "user" | "assistant", content: d.content }))]);
      }
      setHistoryLoaded(true);
    };
    load();
  }, [user, historyLoaded]);

  // Load government schemes
  useEffect(() => {
    const loadSchemes = async () => {
      setSchemesLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke("schemes", {
          body: { language: lang, profile: getProfile() },
        });
        if (!error && data?.schemes) setSchemes(data.schemes);
      } catch { /* silent */ }
      setSchemesLoading(false);
    };
    loadSchemes();
  }, [lang]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const getProfile = () => {
    try {
      const p = JSON.parse(localStorage.getItem("kisanai-profile") || "{}");
      return p;
    } catch { return {}; }
  };

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!user) return;
    await supabase.from("chat_history").insert({ user_id: user.id, role, content });
  };

  const clearHistory = async () => {
    if (!user) return;
    await supabase.from("chat_history").delete().eq("user_id", user.id);
    setMessages([{ role: "assistant", content: t.welcome }]);
    toast.success("Chat history cleared");
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    await saveMessage("user", text);

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          language: lang,
          profile: getProfile(),
        }),
      });

      const data = await resp.json();
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
        await saveMessage("assistant", data.response);
      } else {
        toast.error(data.error || "Sorry, please try again.");
      }
    } catch {
      toast.error("Failed to connect. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <WeatherCard />

      {/* Government Schemes */}
      {schemes.length > 0 && (
        <div className="mb-4 space-y-2">
          <h3 className="font-bold text-foreground text-sm flex items-center gap-2">🏛️ Government Schemes For You</h3>
          {schemes.slice(0, 5).map((s, i) => (
            <div key={i} className="card-farm p-3">
              <button onClick={() => setExpandedScheme(expandedScheme === i ? null : i)}
                className="w-full flex items-center justify-between text-left">
                <div>
                  <p className="font-bold text-foreground text-sm">{s.name}</p>
                  <p className="text-xs text-primary font-semibold">{s.benefit}</p>
                </div>
                {expandedScheme === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedScheme === i && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-3 space-y-2">
                  {s.eligibility?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-foreground">Eligibility:</p>
                      <ul className="text-xs text-muted-foreground space-y-0.5">
                        {s.eligibility.map((e, j) => <li key={j}>• {e}</li>)}
                      </ul>
                    </div>
                  )}
                  {s.how_to_apply?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-foreground">How to Apply:</p>
                      <ol className="text-xs text-muted-foreground space-y-0.5">
                        {s.how_to_apply.map((e, j) => <li key={j}>{j + 1}. {e}</li>)}
                      </ol>
                    </div>
                  )}
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary font-bold hover:underline">Visit Official Website →</a>
                  )}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mb-2">
        <button onClick={clearHistory} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-destructive transition-colors">
          <Trash2 className="w-3 h-3" /> {t.clearHistory}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-3 pb-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-primary text-primary-foreground rounded-br-md" : "bg-secondary text-secondary-foreground rounded-bl-md"
              }`}>
                <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:m-0 [&>ol]:m-0">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {t.quickQuestions.map((q) => (
          <button key={q} onClick={() => sendMessage(q)} disabled={isLoading}
            className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50">
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder={t.chatPlaceholder} disabled={isLoading}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        <button onClick={() => sendMessage(input)} disabled={isLoading || !input.trim()}
          className="p-2 rounded-lg bg-primary hover:opacity-90 transition-opacity disabled:opacity-50">
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-primary-foreground" /> : <Send className="w-4 h-4 text-primary-foreground" />}
        </button>
      </div>
    </div>
  );
};

export default HomeSection;
