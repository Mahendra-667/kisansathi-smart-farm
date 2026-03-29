# 🌾 KisanAI — Har Khet Mein AI
### AI Powered Complete Farming Super App for Indian Farmers

![KisanAI](https://img.shields.io/badge/KisanAI-Farming%20Assistant-green)
![Hackathon](https://img.shields.io/badge/ET%20AI%20Hackathon-2026-orange)
![Problem Statement](https://img.shields.io/badge/Problem%20Statement-5-blue)
![Languages](https://img.shields.io/badge/Languages-6%20Indian%20Languages-yellow)

---

## 🔗 Live Demo
**👉 https://kisansathi-smart-farm.lovable.app**

---

## 🏆 Hackathon Details
- **Event:** ET AI Hackathon 2026
- **Partner:** Unstop
- **Problem Statement:** PS5 — Domain Specialized AI Agents 
  with Compliance Guardrails
- **Domain:** Agriculture
- **Team:** Mahendra

---

## 🚨 Problem We Are Solving

India has **140 million farmers** who struggle daily with:

- ❌ No expert advice on crop diseases
- ❌ No fair market price information
- ❌ Cannot find farm machinery nearby
- ❌ No connection between landowners and farmers
- ❌ Cannot find farm workers when needed
- ❌ No soil health guidance
- ❌ No access to organic farming resources
- ❌ Language barrier — most apps only work in English

**KisanAI solves ALL of this in one single app!**

---

## ✅ Complete Features

### 1. 🤖 AI Farming Chat Assistant
- Powered by Anthropic Claude AI
- Answers any farming question instantly
- Personalized advice based on farmer profile
- Suggests relevant government schemes
- Works in 6 Indian languages

### 2. 🔬 Crop Disease Detector
- Farmer uploads photo of sick plant
- Claude AI vision analyzes the photo
- Shows disease name, severity, cause
- Recommends exact medicine with dosage
- Step by step treatment instructions
- Finds nearest pesticide shop on Google Maps
- Kisan Helpline 1800-180-1551 direct call
- All recommendations follow CIB and RC India guidelines
- Banned pesticides automatically blocked

### 3. 📈 Live Market Prices
- Real mandi prices from data.gov.in Agmarknet API
- Prices shown per KG for easy understanding
- Covers all categories:
  - Vegetables — 20 items
  - Fruits — 14 items
  - Grains — 8 items
  - Pulses — 7 items
  - Flowers — 8 items
  - Spices — 7 items
- State wise filtering for all Indian states
- Price trend arrows showing rise or fall
- AI market intelligence — best crops to sell this week
- Set price alerts for target prices

### 4. 🌤️ Weather Widget
- Auto detects farmer GPS location
- Real time temperature humidity wind speed
- Rain chance percentage
- AI farming tip based on current weather
- Refreshes every 30 minutes automatically

### 5. 🤝 Land Connect
- Landowners post available land with details
- Farmers browse listings sorted by distance
- Direct call and WhatsApp contact
- View land location on Google Maps
- Eliminates middlemen completely

### 6. 🚜 Machinery Rental
- Machine owners post availability with dates and price
- Farmers find machines sorted by nearest first
- Filter by machine type and date
- Direct contact with owner
- Solves seasonal machinery shortage problem

### 7. 👷 Farm Work Jobs
- Farmers post work requirements with GPS
- Workers see ONLY jobs within 30km
- Sorted by nearest first
- Shows wage meals accommodation details
- One tap WhatsApp apply button
- Notification badge for new nearby jobs

### 8. 🧪 Soil Health Analysis
- Upload soil test report or describe verbally
- Claude AI gives soil health score out of 10
- Top 3 recommended crops for that soil
- Organic improvement steps with quantities
- Fertilizer recommendations per acre
- Submit report to Agriculture Officer button
- Officer contacts farmer within 3 working days
- Reference number for tracking

### 9. 🌱 Organic Market
- Buy and sell gobar vermicompost compost
- Organic fertilizer neem cake bone meal
- Product photos with listing
- Distance based sorting
- Direct call and WhatsApp contact
- Learn Organic tab with complete guide
- Promotes natural farming practices

### 10. 👨‍🌾 Farmer Profile
- Complete farmer information storage
- Farm size crops farming type water source
- Used to personalize all AI responses
- Profile completion percentage tracker

### 11. 🏛️ Government Schemes
- Personalized scheme recommendations
- Based on farmer profile automatically
- PM Kisan Samman Nidhi
- Soil Health Card Scheme
- Pradhan Mantri Fasal Bima Yojana
- Kisan Credit Card
- eNAM Electronic National Agriculture Market
- Paramparagat Krishi Vikas Yojana

### 12. 🔔 Smart Notifications
- New farm jobs within 30km
- New machinery available nearby
- New land listings in district
- Price alerts when target reached
- Soil report status updates

---

## 🌐 Languages Supported

| Language | Code |
|----------|------|
| English | en |
| हिंदी Hindi | hi |
| ಕನ್ನಡ Kannada | kn |
| తెలుగు Telugu | te |
| தமிழ் Tamil | ta |
| മലയാളം Malayalam | ml |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React TypeScript |
| Backend | Supabase Edge Functions |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| AI Brain | Anthropic Claude claude-sonnet-4-20250514 |
| Weather | OpenWeatherMap API |
| Market Data | data.gov.in Agmarknet API |
| Maps | Google Maps |
| Hosting | Lovable |

---

## 🤖 AI Agent Architecture
```
Farmer Input (Text / Voice / Image)
           ↓
    Orchestrator Agent (Claude AI)
    Intent Classification and Routing
           ↓
┌──────────────────────────────────┐
│  Specialist Agents               │
│  🌱 Soil Agent                   │
│  🌦️ Weather Agent                │
│  📈 Market Agent                 │
│  🐛 Disease Agent                │
│  🏛️ Scheme Agent                 │
└──────────────────────────────────┘
           ↓
  Compliance Guardrail Layer
  Banned Pesticide Check
  CIB and RC India Guidelines
           ↓
    Farmer Gets Safe Response
    In Their Own Language
```

---

## 💰 Impact Model

| Metric | Value |
|--------|-------|
| Saving from better crop selection | ₹12,000 per farmer per year |
| Saving from market price optimization | ₹18,000 per farmer per year |
| Saving from early pest detection | ₹9,600 per farmer per year |
| Saving from weather guided irrigation | ₹6,000 per farmer per year |
| **Total saving per farmer per year** | **₹45,600** |
| At 1 lakh farmers adoption | **₹456 Crore** |
| India potential 140 million farmers | **₹63,840 Crore** |

---

## 🛡️ Compliance and Safety

- All disease medicine recommendations follow **CIB and RC India** approved pesticide guidelines
- **Banned pesticides automatically blocked** — Endosulfan, Monocrotophos, Methyl Parathion, Carbofuran, Phorate, Triazophos
- Safe approved alternatives suggested automatically
- Every AI recommendation logged in audit trail
- Agriculture officer alert system for soil issues
- Compliance badge shown on all AI recommendations

---

## ⚙️ Environment Variables
```
ANTHROPIC_API_KEY = Your Anthropic Claude API key
OPENWEATHER_KEY = Your OpenWeatherMap API key  
DATA_GOV_KEY = Your data.gov.in API key
```

---

## 🚀 Setup Instructions
```bash
# Step 1 — Clone repository
git clone https://github.com/Mahendra-667/kisansathi-smart-farm.git

# Step 2 — Install dependencies
cd kisansathi-smart-farm
npm install

# Step 3 — Add environment variables
# Add ANTHROPIC_API_KEY, OPENWEATHER_KEY, DATA_GOV_KEY
# in Supabase Edge Function secrets

# Step 4 — Run locally
npm run dev

# Step 5 — Deploy edge functions
supabase functions deploy chat
supabase functions deploy disease-check
supabase functions deploy market-prices
supabase functions deploy weather
supabase functions deploy soil-analysis
supabase functions deploy schemes
```

---

## 📊 Database Schema
```
land_listings — id, owner_name, village, district, 
                state, lat, lng, acres, soil_type, 
                water_source, crops, rent, phone, 
                whatsapp, created_at

machinery_listings — id, owner_name, machine_type, 
                     brand, village, district, lat, lng,
                     available_from, available_to, 
                     price_per_day, fuel_included, 
                     operator_included, phone, created_at

farm_jobs — id, farmer_name, work_type, crop, 
            start_date, end_date, village, district, 
            lat, lng, workers_needed, wage_per_day, 
            meals, accommodation, advance, phone, created_at

organic_listings — id, seller_name, product_type, 
                   quantity, unit, price, village, 
                   district, lat, lng, phone, 
                   photo_url, created_at

authority_alerts — id, farmer_name, village, district,
                   phone, problem_description, lat, lng,
                   status, reference_number, created_at

ai_logs — id, agent_name, input_summary, 
          output_summary, compliance_status, 
          timestamp

notifications — id, user_location, message, type,
                read, created_at

price_alerts — id, crop_name, target_price, 
               phone, created_at
```

---

## 🎯 Problem Statement Alignment

| PS5 Requirement | KisanAI Solution |
|----------------|-----------------|
| Domain expertise depth | Deep Indian agriculture knowledge in Claude AI |
| Compliance and guardrail enforcement | CIB and RC banned pesticide blocking |
| Edge case handling | Offline mode, API fallbacks, low connectivity support |
| Full task completion | Farmer uploads photo gets disease medicine finds shop in one flow |
| Auditability of agent decisions | Complete AI log in Supabase ai_logs table |

---

## 👨‍💻 Built By

**Mahendra**
ET AI Hackathon 2026 — Problem Statement 5

---

*🌾 Har Khet Mein AI — AI in Every Farm 🌾*
