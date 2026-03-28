import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Trash2 } from "lucide-react";
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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

async function sendChatRequest({ messages, language, onResponse, onError }: {
  messages: { role: string; content: string }[];
  language: string;
  onResponse: (text: string) => void;
  onError: (err: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ messages, language }),
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({ error: "Request failed" }));
      onError(err.error || "Sorry, please try again.");
      return;
    }
    const data = await resp.json();
    if (data.response) {
      onResponse(data.response);
    } else {
      onError("Sorry, please try again.");
    }
  } catch {
    onError("Failed to connect to AI. Please try again.");
  }
}

const HomeSection = () => {
  const { user } = useAuth();
  const { lang, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: t.welcome }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

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

    await sendChatRequest({
      messages: newMessages.map(m => ({ role: m.role, content: m.content })),
      language: lang,
      onResponse: async (response) => {
        setMessages(prev => [...prev, { role: "assistant", content: response }]);
        setIsLoading(false);
        await saveMessage("assistant", response);
      },
      onError: (err) => { toast.error(err); setIsLoading(false); },
    });
  };

  return (
    <div className="flex flex-col h-full">
      <WeatherCard />
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
          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
