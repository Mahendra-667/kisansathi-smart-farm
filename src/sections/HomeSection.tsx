import { useState } from "react";
import { Send, ImagePlus, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "ai";
  text: string;
}

const quickQuestions = [
  "Best time to sow wheat?",
  "How to increase tomato yield?",
  "Organic pest control tips",
  "Water management for rice",
];

const HomeSection = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", text: "🙏 Namaste! I'm your KisanAI assistant. Ask me anything about farming — crop advice, weather tips, disease identification, and more!" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: getAIResponse(text) },
      ]);
    }, 800);
  };

  const getAIResponse = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes("wheat")) return "🌾 Best time to sow wheat in North India is mid-October to mid-November. Use HD-2967 or PBW-343 varieties for best yield. Ensure soil pH is 6.0-7.5.";
    if (lower.includes("tomato")) return "🍅 For higher tomato yield: Use drip irrigation, apply NPK 120:60:60 kg/ha, prune side shoots, and maintain 60cm spacing between plants.";
    if (lower.includes("organic") || lower.includes("pest")) return "🌿 Organic pest control: Use neem oil spray (5ml/L), install yellow sticky traps, companion plant with marigolds, and spray garlic-chilli solution for aphids.";
    if (lower.includes("rice") || lower.includes("water")) return "🌊 Rice water management: Maintain 5cm standing water during tillering. Use AWD (Alternate Wetting & Drying) technique to save 30% water.";
    return "🌱 Great question! Based on current agricultural best practices, I recommend consulting your local Krishi Vigyan Kendra for region-specific advice. I can help with crop planning, disease identification, and market prices!";
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-2 flex-wrap mb-3">
        {quickQuestions.map((q) => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-full font-semibold hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-xl p-2">
        <button className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors">
          <ImagePlus className="w-5 h-5 text-primary" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Ask about farming..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          onClick={() => sendMessage(input)}
          className="p-2 rounded-lg bg-primary hover:opacity-90 transition-opacity"
        >
          <Send className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default HomeSection;
