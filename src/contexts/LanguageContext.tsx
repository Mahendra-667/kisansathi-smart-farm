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
  postLand: string; findLand: string;
  rentMachine: string; findMachine: string;
  postWork: string; findWork: string;
  postProduct: string; browseMarket: string;
  uploadPhoto: string; analyzeBtn: string;
  callOwner: string; callSeller: string; applyNow: string;
  loading: string; noResults: string;
  fillAllFields: string; posted: string;
}> = {
  en: {
    chatPlaceholder: "Ask about farming...",
    clearHistory: "Clear History",
    quickQuestions: ["Best crop for my soil", "Weather advice today", "Market prices today", "Organic farming tips", "Government schemes for me", "Pest control advice"],
    navLabels: { home: "Home", disease: "Disease", market: "Market", land: "Land", machines: "Machines", work: "Work", soil: "Soil", organic: "Organic" },
    sectionTitles: { home: "🏠 AI Farming Assistant", disease: "🔬 Disease Check", market: "📈 Market Prices", land: "🌾 Land Connect", machines: "🚜 Farm Machines", work: "👷 Farm Work", soil: "🧪 Soil Health", organic: "🌿 Organic Market" },
    welcome: "🙏 Namaste! I'm KisanAI, your smart farming assistant powered by Claude AI. Ask me anything about farming — crop advice, weather tips, disease identification, government schemes, and more!",
    send: "Send",
    postLand: "Post My Land", findLand: "Find Land",
    rentMachine: "Rent Out Machine", findMachine: "Find Machine",
    postWork: "Post Work", findWork: "Find Work",
    postProduct: "Post Product", browseMarket: "Browse Market",
    uploadPhoto: "Upload Photo", analyzeBtn: "Analyze",
    callOwner: "Call Owner", callSeller: "Call Seller", applyNow: "Apply Now",
    loading: "Loading...", noResults: "No results found",
    fillAllFields: "Please fill all fields", posted: "Posted successfully!",
  },
  hi: {
    chatPlaceholder: "खेती के बारे में पूछें...",
    clearHistory: "इतिहास मिटाएं",
    quickQuestions: ["मेरी मिट्टी के लिए सबसे अच्छी फसल", "आज मौसम की सलाह", "आज के बाजार भाव", "जैविक खेती सुझाव", "मेरे लिए सरकारी योजनाएं", "कीट नियंत्रण सलाह"],
    navLabels: { home: "होम", disease: "रोग", market: "बाजार", land: "जमीन", machines: "मशीनें", work: "काम", soil: "मिट्टी", organic: "जैविक" },
    sectionTitles: { home: "🏠 AI कृषि सहायक", disease: "🔬 रोग जांच", market: "📈 बाजार भाव", land: "🌾 जमीन कनेक्ट", machines: "🚜 कृषि मशीनें", work: "👷 कृषि कार्य", soil: "🧪 मिट्टी स्वास्थ्य", organic: "🌿 जैविक बाजार" },
    welcome: "🙏 नमस्ते! मैं KisanAI हूं, Claude AI से संचालित आपका स्मार्ट कृषि सहायक। खेती से जुड़ा कोई भी सवाल पूछें!",
    send: "भेजें",
    postLand: "अपनी जमीन पोस्ट करें", findLand: "जमीन खोजें",
    rentMachine: "मशीन किराये पर दें", findMachine: "मशीन खोजें",
    postWork: "काम पोस्ट करें", findWork: "काम खोजें",
    postProduct: "उत्पाद पोस्ट करें", browseMarket: "बाजार ब्राउज़ करें",
    uploadPhoto: "फोटो अपलोड करें", analyzeBtn: "विश्लेषण करें",
    callOwner: "मालिक को कॉल करें", callSeller: "विक्रेता को कॉल करें", applyNow: "आवेदन करें",
    loading: "लोड हो रहा है...", noResults: "कोई परिणाम नहीं",
    fillAllFields: "सभी फ़ील्ड भरें", posted: "सफलतापूर्वक पोस्ट किया!",
  },
  kn: {
    chatPlaceholder: "ಕೃಷಿಯ ಬಗ್ಗೆ ಕೇಳಿ...",
    clearHistory: "ಇತಿಹಾಸ ಅಳಿಸಿ",
    quickQuestions: ["ನನ್ನ ಮಣ್ಣಿಗೆ ಉತ್ತಮ ಬೆಳೆ", "ಇಂದಿನ ಹವಾಮಾನ ಸಲಹೆ", "ಇಂದಿನ ಮಾರುಕಟ್ಟೆ ಬೆಲೆ", "ಸಾವಯವ ಕೃಷಿ ಸಲಹೆ", "ನನಗೆ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು", "ಕೀಟ ನಿಯಂತ್ರಣ ಸಲಹೆ"],
    navLabels: { home: "ಮನೆ", disease: "ರೋಗ", market: "ಮಾರುಕಟ್ಟೆ", land: "ಭೂಮಿ", machines: "ಯಂತ್ರಗಳು", work: "ಕೆಲಸ", soil: "ಮಣ್ಣು", organic: "ಸಾವಯವ" },
    sectionTitles: { home: "🏠 AI ಕೃಷಿ ಸಹಾಯಕ", disease: "🔬 ರೋಗ ಪರೀಕ್ಷೆ", market: "📈 ಮಾರುಕಟ್ಟೆ ಬೆಲೆ", land: "🌾 ಭೂಮಿ ಕನೆಕ್ಟ್", machines: "🚜 ಕೃಷಿ ಯಂತ್ರಗಳು", work: "👷 ಕೃಷಿ ಕೆಲಸ", soil: "🧪 ಮಣ್ಣಿನ ಆರೋಗ್ಯ", organic: "🌿 ಸಾವಯವ ಮಾರುಕಟ್ಟೆ" },
    welcome: "🙏 ನಮಸ್ಕಾರ! ನಾನು KisanAI, Claude AI ಆಧಾರಿತ ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ. ಕೃಷಿ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ!",
    send: "ಕಳುಹಿಸಿ",
    postLand: "ನಿಮ್ಮ ಭೂಮಿ ಪೋಸ್ಟ್ ಮಾಡಿ", findLand: "ಭೂಮಿ ಹುಡುಕಿ",
    rentMachine: "ಯಂತ್ರ ಬಾಡಿಗೆ ನೀಡಿ", findMachine: "ಯಂತ್ರ ಹುಡುಕಿ",
    postWork: "ಕೆಲಸ ಪೋಸ್ಟ್ ಮಾಡಿ", findWork: "ಕೆಲಸ ಹುಡುಕಿ",
    postProduct: "ಉತ್ಪನ್ನ ಪೋಸ್ಟ್ ಮಾಡಿ", browseMarket: "ಮಾರುಕಟ್ಟೆ ಬ್ರೌಸ್ ಮಾಡಿ",
    uploadPhoto: "ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ", analyzeBtn: "ವಿಶ್ಲೇಷಿಸಿ",
    callOwner: "ಮಾಲೀಕರಿಗೆ ಕರೆ ಮಾಡಿ", callSeller: "ಮಾರಾಟಗಾರರಿಗೆ ಕರೆ", applyNow: "ಅರ್ಜಿ ಸಲ್ಲಿಸಿ",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...", noResults: "ಫಲಿತಾಂಶಗಳಿಲ್ಲ",
    fillAllFields: "ಎಲ್ಲ ಕ್ಷೇತ್ರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ", posted: "ಯಶಸ್ವಿಯಾಗಿ ಪೋಸ್ಟ್ ಮಾಡಲಾಗಿದೆ!",
  },
  te: {
    chatPlaceholder: "వ్యవసాయం గురించి అడగండి...",
    clearHistory: "చరిత్ర తొలగించు",
    quickQuestions: ["నా నేలకు ఉత్తమ పంట", "ఈరోజు వాతావరణ సలహా", "ఈరోజు మార్కెట్ ధరలు", "సేంద్రియ వ్యవసాయ చిట్కాలు", "నాకు ప్రభుత్వ పథకాలు", "పురుగు నియంత్రణ సలహా"],
    navLabels: { home: "హోమ్", disease: "వ్యాధి", market: "మార్కెట్", land: "భూమి", machines: "యంత్రాలు", work: "పని", soil: "నేల", organic: "సేంద్రియ" },
    sectionTitles: { home: "🏠 AI వ్యవసాయ సహాయకుడు", disease: "🔬 వ్యాధి పరీక్ష", market: "📈 మార్కెట్ ధరలు", land: "🌾 భూమి కనెక్ట్", machines: "🚜 వ్యవసాయ యంత్రాలు", work: "👷 వ్యవసాయ పని", soil: "🧪 నేల ఆరోగ్యం", organic: "🌿 సేంద్రియ మార్కెట్" },
    welcome: "🙏 నమస్తే! నేను KisanAI, Claude AI ఆధారిత మీ స్మార్ట్ వ్యవసాయ సహాయకుడిని. వ్యవసాయం గురించి ఏదైనా అడగండి!",
    send: "పంపు",
    postLand: "మీ భూమి పోస్ట్ చేయండి", findLand: "భూమి కనుగొనండి",
    rentMachine: "యంత్రం అద్దెకు ఇవ్వండి", findMachine: "యంత్రం కనుగొనండి",
    postWork: "పని పోస్ట్ చేయండి", findWork: "పని కనుగొనండి",
    postProduct: "ఉత్పత్తి పోస్ట్ చేయండి", browseMarket: "మార్కెట్ బ్రౌజ్ చేయండి",
    uploadPhoto: "ఫోటో అప్లోడ్", analyzeBtn: "విశ్లేషించు",
    callOwner: "యజమానికి కాల్ చేయండి", callSeller: "విక్రేతకు కాల్", applyNow: "దరఖాస్తు చేయండి",
    loading: "లోడ్ అవుతోంది...", noResults: "ఫలితాలు లేవు",
    fillAllFields: "అన్ని ఫీల్డ్‌లు నింపండి", posted: "విజయవంతంగా పోస్ట్ చేయబడింది!",
  },
  ta: {
    chatPlaceholder: "விவசாயம் பற்றி கேளுங்கள்...",
    clearHistory: "வரலாறு அழி",
    quickQuestions: ["என் மண்ணுக்கு சிறந்த பயிர்", "இன்றைய வானிலை ஆலோசனை", "இன்றைய சந்தை விலைகள்", "இயற்கை விவசாய குறிப்புகள்", "எனக்கான அரசு திட்டங்கள்", "பூச்சி கட்டுப்பாடு ஆலோசனை"],
    navLabels: { home: "முகப்பு", disease: "நோய்", market: "சந்தை", land: "நிலம்", machines: "இயந்திரங்கள்", work: "வேலை", soil: "மண்", organic: "இயற்கை" },
    sectionTitles: { home: "🏠 AI விவசாய உதவியாளர்", disease: "🔬 நோய் பரிசோதனை", market: "📈 சந்தை விலைகள்", land: "🌾 நிலம் கனெக்ட்", machines: "🚜 விவசாய இயந்திரங்கள்", work: "👷 விவசாய வேலை", soil: "🧪 மண் ஆரோக்கியம்", organic: "🌿 இயற்கை சந்தை" },
    welcome: "🙏 வணக்கம்! நான் KisanAI, Claude AI இயங்கும் உங்கள் ஸ்மார்ட் விவசாய உதவியாளர். விவசாயம் பற்றி எதையும் கேளுங்கள்!",
    send: "அனுப்பு",
    postLand: "உங்கள் நிலத்தை பதிவிடுங்கள்", findLand: "நிலம் தேடுங்கள்",
    rentMachine: "இயந்திரம் வாடகைக்கு", findMachine: "இயந்திரம் தேடுங்கள்",
    postWork: "வேலை பதிவிடுங்கள்", findWork: "வேலை தேடுங்கள்",
    postProduct: "பொருள் பதிவிடுங்கள்", browseMarket: "சந்தை பார்வையிடுங்கள்",
    uploadPhoto: "புகைப்படம் பதிவேற்றம்", analyzeBtn: "பகுப்பாய்வு",
    callOwner: "உரிமையாளரை அழைக்கவும்", callSeller: "விற்பனையாளரை அழைக்கவும்", applyNow: "விண்ணப்பிக்கவும்",
    loading: "ஏற்றுகிறது...", noResults: "முடிவுகள் இல்லை",
    fillAllFields: "அனைத்து புலங்களையும் நிரப்பவும்", posted: "வெற்றிகரமாக பதிவிடப்பட்டது!",
  },
  ml: {
    chatPlaceholder: "കൃഷിയെക്കുറിച്ച് ചോദിക്കൂ...",
    clearHistory: "ചരിത്രം മായ്ക്കുക",
    quickQuestions: ["എന്റെ മണ്ണിന് ഏറ്റവും നല്ല വിള", "ഇന്നത്തെ കാലാവസ്ഥ ഉപദേശം", "ഇന്നത്തെ വിപണി വിലകൾ", "ജൈവ കൃഷി നുറുങ്ങുകൾ", "എനിക്കുള്ള സർക്കാർ പദ്ധതികൾ", "കീടനിയന്ത്രണ ഉപദേശം"],
    navLabels: { home: "ഹോം", disease: "രോഗം", market: "മാർക്കറ്റ്", land: "ഭൂമി", machines: "യന്ത്രങ്ങൾ", work: "ജോലി", soil: "മണ്ണ്", organic: "ജൈവ" },
    sectionTitles: { home: "🏠 AI കൃഷി സഹായി", disease: "🔬 രോഗ പരിശോധന", market: "📈 വിപണി വിലകൾ", land: "🌾 ഭൂമി കണക്ട്", machines: "🚜 കൃഷി യന്ത്രങ്ങൾ", work: "👷 കൃഷി ജോലി", soil: "🧪 മണ്ണിന്റെ ആരോഗ്യം", organic: "🌿 ജൈവ മാർക്കറ്റ്" },
    welcome: "🙏 നമസ്കാരം! ഞാൻ KisanAI, Claude AI ഉപയോഗിച്ചുള്ള നിങ്ങളുടെ സ്മാർട്ട് കൃഷി സഹായിയാണ്. കൃഷിയെക്കുറിച്ച് എന്തും ചോദിക്കൂ!",
    send: "അയക്കുക",
    postLand: "നിങ്ങളുടെ ഭൂമി പോസ്റ്റ് ചെയ്യുക", findLand: "ഭൂമി കണ്ടെത്തുക",
    rentMachine: "യന്ത്രം വാടകയ്ക്ക്", findMachine: "യന്ത്രം കണ്ടെത്തുക",
    postWork: "ജോലി പോസ്റ്റ് ചെയ്യുക", findWork: "ജോലി കണ്ടെത്തുക",
    postProduct: "ഉൽപ്പന്നം പോസ്റ്റ് ചെയ്യുക", browseMarket: "മാർക്കറ്റ് ബ്രൗസ് ചെയ്യുക",
    uploadPhoto: "ഫോട്ടോ അപ്ലോഡ്", analyzeBtn: "വിശകലനം",
    callOwner: "ഉടമയെ വിളിക്കുക", callSeller: "വിൽപ്പനക്കാരനെ വിളിക്കുക", applyNow: "അപേക്ഷിക്കുക",
    loading: "ലോഡ് ചെയ്യുന്നു...", noResults: "ഫലങ്ങളില്ല",
    fillAllFields: "എല്ലാ ഫീൽഡുകളും പൂരിപ്പിക്കുക", posted: "വിജയകരമായി പോസ്റ്റ് ചെയ്തു!",
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
