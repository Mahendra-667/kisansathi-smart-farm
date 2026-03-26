import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type LangCode = "en" | "hi" | "kn" | "te" | "ta" | "ml";

export const languages: { code: LangCode; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "te", label: "తెలుగు" },
  { code: "ta", label: "தமிழ்" },
  { code: "ml", label: "മലയാളം" },
];

export const translations: Record<LangCode, {
  chatPlaceholder: string;
  clearHistory: string;
  quickQuestions: string[];
  navLabels: Record<string, string>;
  sectionTitles: Record<string, string>;
  welcome: string;
  send: string;
}> = {
  en: {
    chatPlaceholder: "Ask about farming...",
    clearHistory: "Clear History",
    quickQuestions: ["Best time to sow wheat?", "How to increase tomato yield?", "Organic pest control tips", "Water management for rice"],
    navLabels: { home: "Home", disease: "Disease", market: "Market", land: "Land", machines: "Machines", work: "Work", soil: "Soil", organic: "Organic" },
    sectionTitles: { home: "🏠 AI Farming Assistant", disease: "🔬 Disease Check", market: "📈 Market Prices", land: "🌾 Land Connect", machines: "🚜 Farm Machines", work: "👷 Farm Work", soil: "🧪 Soil Health", organic: "🌿 Organic Market" },
    welcome: "🙏 Namaste! I'm your KisanAI assistant. Ask me anything about farming — crop advice, weather tips, disease identification, and more!",
    send: "Send",
  },
  hi: {
    chatPlaceholder: "खेती के बारे में पूछें...",
    clearHistory: "इतिहास मिटाएं",
    quickQuestions: ["गेहूं बोने का सबसे अच्छा समय?", "टमाटर की उपज कैसे बढ़ाएं?", "जैविक कीट नियंत्रण सुझाव", "धान में पानी प्रबंधन"],
    navLabels: { home: "होम", disease: "रोग", market: "बाजार", land: "जमीन", machines: "मशीनें", work: "काम", soil: "मिट्टी", organic: "जैविक" },
    sectionTitles: { home: "🏠 AI कृषि सहायक", disease: "🔬 रोग जांच", market: "📈 बाजार भाव", land: "🌾 जमीन कनेक्ट", machines: "🚜 कृषि मशीनें", work: "👷 कृषि कार्य", soil: "🧪 मिट्टी स्वास्थ्य", organic: "🌿 जैविक बाजार" },
    welcome: "🙏 नमस्ते! मैं आपका KisanAI सहायक हूं। खेती से जुड़ा कोई भी सवाल पूछें!",
    send: "भेजें",
  },
  kn: {
    chatPlaceholder: "ಕೃಷಿಯ ಬಗ್ಗೆ ಕೇಳಿ...",
    clearHistory: "ಇತಿಹಾಸ ಅಳಿಸಿ",
    quickQuestions: ["ಗೋಧಿ ಬಿತ್ತಲು ಉತ್ತಮ ಸಮಯ?", "ಟೊಮೆಟೋ ಇಳುವರಿ ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ?", "ಸಾವಯವ ಕೀಟ ನಿಯಂತ್ರಣ ಸಲಹೆ", "ಭತ್ತಕ್ಕೆ ನೀರಿನ ನಿರ್ವಹಣೆ"],
    navLabels: { home: "ಮನೆ", disease: "ರೋಗ", market: "ಮಾರುಕಟ್ಟೆ", land: "ಭೂಮಿ", machines: "ಯಂತ್ರಗಳು", work: "ಕೆಲಸ", soil: "ಮಣ್ಣು", organic: "ಸಾವಯವ" },
    sectionTitles: { home: "🏠 AI ಕೃಷಿ ಸಹಾಯಕ", disease: "🔬 ರೋಗ ಪರೀಕ್ಷೆ", market: "📈 ಮಾರುಕಟ್ಟೆ ಬೆಲೆ", land: "🌾 ಭೂಮಿ ಕನೆಕ್ಟ್", machines: "🚜 ಕೃಷಿ ಯಂತ್ರಗಳು", work: "👷 ಕೃಷಿ ಕೆಲಸ", soil: "🧪 ಮಣ್ಣಿನ ಆರೋಗ್ಯ", organic: "🌿 ಸಾವಯವ ಮಾರುಕಟ್ಟೆ" },
    welcome: "🙏 ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ KisanAI ಸಹಾಯಕ. ಕೃಷಿ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ!",
    send: "ಕಳುಹಿಸಿ",
  },
  te: {
    chatPlaceholder: "వ్యవసాయం గురించి అడగండి...",
    clearHistory: "చరిత్ర తొలగించు",
    quickQuestions: ["గోధుమ విత్తడానికి ఉత్తమ సమయం?", "టమాటో దిగుబడి ఎలా పెంచాలి?", "సేంద్రియ పురుగు నియంత్రణ చిట్కాలు", "వరికి నీటి నిర్వహణ"],
    navLabels: { home: "హోమ్", disease: "వ్యాధి", market: "మార్కెట్", land: "భూమి", machines: "యంత్రాలు", work: "పని", soil: "నేల", organic: "సేంద్రియ" },
    sectionTitles: { home: "🏠 AI వ్యవసాయ సహాయకుడు", disease: "🔬 వ్యాధి పరీక్ష", market: "📈 మార్కెట్ ధరలు", land: "🌾 భూమి కనెక్ట్", machines: "🚜 వ్యవసాయ యంత్రాలు", work: "👷 వ్యవసాయ పని", soil: "🧪 నేల ఆరోగ్యం", organic: "🌿 సేంద్రియ మార్కెట్" },
    welcome: "🙏 నమస్తే! నేను మీ KisanAI సహాయకుడిని. వ్యవసాయం గురించి ఏదైనా అడగండి!",
    send: "పంపు",
  },
  ta: {
    chatPlaceholder: "விவசாயம் பற்றி கேளுங்கள்...",
    clearHistory: "வரலாறு அழி",
    quickQuestions: ["கோதுமை விதைக்க சிறந்த நேரம்?", "தக்காளி விளைச்சலை அதிகரிப்பது எப்படி?", "இயற்கை பூச்சி கட்டுப்பாடு குறிப்புகள்", "நெல்லுக்கு நீர் மேலாண்மை"],
    navLabels: { home: "முகப்பு", disease: "நோய்", market: "சந்தை", land: "நிலம்", machines: "இயந்திரங்கள்", work: "வேலை", soil: "மண்", organic: "இயற்கை" },
    sectionTitles: { home: "🏠 AI விவசாய உதவியாளர்", disease: "🔬 நோய் பரிசோதனை", market: "📈 சந்தை விலைகள்", land: "🌾 நிலம் கனெக்ட்", machines: "🚜 விவசாய இயந்திரங்கள்", work: "👷 விவசாய வேலை", soil: "🧪 மண் ஆரோக்கியம்", organic: "🌿 இயற்கை சந்தை" },
    welcome: "🙏 வணக்கம்! நான் உங்கள் KisanAI உதவியாளர். விவசாயம் பற்றி எதையும் கேளுங்கள்!",
    send: "அனுப்பு",
  },
  ml: {
    chatPlaceholder: "കൃഷിയെക്കുറിച്ച് ചോദിക്കൂ...",
    clearHistory: "ചരിത്രം മായ്ക്കുക",
    quickQuestions: ["ഗോതമ്പ് വിതയ്ക്കാൻ ഏറ്റവും നല്ല സമയം?", "തക്കാളി വിളവ് എങ്ങനെ കൂട്ടാം?", "ജൈവ കീടനിയന്ത്രണ നുറുങ്ങുകൾ", "നെല്ലിന് ജല പരിപാലനം"],
    navLabels: { home: "ഹോം", disease: "രോഗം", market: "മാർക്കറ്റ്", land: "ഭൂമി", machines: "യന്ത്രങ്ങൾ", work: "ജോലി", soil: "മണ്ണ്", organic: "ജൈവ" },
    sectionTitles: { home: "🏠 AI കൃഷി സഹായി", disease: "🔬 രോഗ പരിശോധന", market: "📈 വിപണി വിലകൾ", land: "🌾 ഭൂമി കണക്ട്", machines: "🚜 കൃഷി യന്ത്രങ്ങൾ", work: "👷 കൃഷി ജോലി", soil: "🧪 മണ്ണിന്റെ ആരോഗ്യം", organic: "🌿 ജൈവ മാർക്കറ്റ്" },
    welcome: "🙏 നമസ്കാരം! ഞാൻ നിങ്ങളുടെ KisanAI സഹായിയാണ്. കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കൂ!",
    send: "അയക്കുക",
  },
};

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: typeof translations["en"];
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<LangCode>(() => {
    return (localStorage.getItem("kisanai-lang") as LangCode) || "en";
  });

  const setLang = (code: LangCode) => {
    setLangState(code);
    localStorage.setItem("kisanai-lang", code);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
};
