# BreatheIQ — Challenge Submission Document

**Challenge:** Let's Code Diwali Challenge 2026  
**Theme:** Technology for Cleaner Air  
**Category:** Real-Time Air Quality Intelligence Platform  
**Participant:** Sabir (2nd Year CSE - IoT)  
**Project Name:** BreatheIQ  
**Tagline:** Understand Your Air. Protect Your Health.  

---

## 1. Project Overview & Pitch

Air pollution is one of the most critical public health crises of our time. Every year, millions suffer from exposure to toxic particulate matter and hazardous atmospheric gases without understanding what they are inhaling or how to protect themselves. Most existing tools either show raw numbers with no context or invent arbitrary index scores without scientific grounding.

**BreatheIQ** solves this by converting live environmental data from authoritative public monitoring stations into clear, actionable intelligence. It brings real-time US-EPA AQI calculations, interactive station maps, 5-day predictive forecasts, multi-location comparison, clean air discovery, and health advice together in a dashboard.

---

## 2. Challenge Form Answers (Ready to Copy & Paste)

### Project Description
> BreatheIQ is a real-time Air Quality Intelligence Platform that helps people monitor, understand, and respond to air pollution. It provides air-quality information, pollutant-level monitoring, interactive pollution maps, historical trends, location comparisons, health and safety recommendations, and air-quality forecasts. The platform uses authentic public APIs to transform environmental data into understandable and actionable insights, helping users make informed decisions about their surroundings and health.

### Mandatory Features Implemented (All 6 Verified)
- [x] **Live AQI Dashboard:** Features real-time US-EPA standard AQI calculation (with documented breakpoints), individual cards for all 6 criterion pollutants (PM2.5, PM10, NO₂, SO₂, CO, O₃), safe threshold indicators, and OpenStreetMap geocoding search.
- [x] **Interactive Air Quality Map:** Full-screen Leaflet & OpenStreetMap visualization rendering real ground-monitoring stations with color-coded severity markers, clickable inspection popups, and live telemetry attribution.
- [x] **Historical Pollution Tracker:** Hourly and daily historical analytics with interactive Recharts line & bar visualizations, pollutant filtering, and statistical summaries (mean, peak, minimum).
- [x] **Location Comparison:** Side-by-side comparative engine supporting 2 to 4 locations simultaneously with relative pollutant radar charts, comparative AQI cards, and delta tables.
- [x] **Health & Safety Dashboard:** Comprehensive activity guidelines (exercise, outdoor play, indoor ventilation), targeted advice for vulnerable demographics (children, elderly, respiratory/cardiac patients), and scientific explainers for all 6 pollutants.
- [x] **AQI Forecast:** 5-day predictive air quality forecast with 72-hour hourly trends and daily averages powered by the Open-Meteo Air Quality API, strictly distinguished from ground-station observations.

### Bonus Features Implemented
- [x] **Multi-API Integration:** Server-side aggregation across OpenAQ v3, Open-Meteo Air Quality API, and OpenStreetMap.
- [x] **Clean Air Finder:** Ranks and filters regional monitoring stations by lowest measured PM2.5 to direct users toward relatively cleaner air zones.
- [x] **AI / Environmental Assistant:** Intelligent contextual assistant responding to queries regarding air quality, pollutant risks, and health guidance using real API telemetry as context.
- [x] **Smart In-App Alerts:** Local-storage backed custom threshold monitoring alerting users when pollutants exceed recommended WHO guidelines.
- [x] **Dark & Light Mode:** Dual theme support with Dark Navy (`#0f172a`) and Emerald Green branding.

### Authentic Public APIs Used
1. **OpenAQ API v3** — Official international repository for ground-level air quality monitoring stations.
2. **Open-Meteo Air Quality API** — High-resolution atmospheric dispersion modeling for current estimates and 5-day forecasts.
3. **OpenStreetMap & Nominatim** — Open geospatial mapping tiles and forward geocoding.

### Technologies & Frameworks
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React
- **Data Visualization:** Recharts, SVG Gauge Graphics
- **Maps:** Leaflet, React Leaflet, OpenStreetMap
- **Backend & APIs:** Next.js Server Route Handlers, Node.js
- **State & Theme:** React Context, Next-Themes, LocalStorage

---

## 3. Demo Video Presentation Script (2:30 Timing Breakdown)

Use this script when recording your 2 to 3 minute demonstration screen recording:

| Timestamp | Section | Narration & Visual Actions |
|---|---|---|
| **0:00 – 0:20** | **Introduction** | *"Hello judges, I'm Sabir, a 2nd-year CSE student, and this is BreatheIQ — an Air Quality Intelligence Platform built for the Let's Code Diwali Challenge under the theme 'Technology for Cleaner Air'. Air pollution is often invisible and confusing. BreatheIQ transforms real environmental data into actionable insights to protect public health."* |
| **0:20 – 0:45** | **Live Dashboard & US-EPA AQI** | *[Show home screen]* *"On the dashboard, we calculate the Air Quality Index strictly using the US-EPA standard based on actual pollutant breakpoints. You can see live readings for all 6 major pollutants: PM2.5, PM10, Nitrogen Dioxide, Sulfur Dioxide, Carbon Monoxide, and Ozone. Each card displays concentrations, safe thresholds, and freshness. Let's search for a city like Tokyo or London — the dashboard updates instantly."* |
| **0:45 – 1:10** | **Interactive Map** | *[Navigate to `/map`]* *"Next, our Interactive Air Quality Map built with React Leaflet and OpenStreetMap. Every marker represents an actual ground-monitoring station. The colors represent pollution severity. Clicking any station reveals its live readings, reporting agency, and measurement timestamp."* |
| **1:10 – 1:30** | **Historical Analytics** | *[Navigate to `/analytics`]* *"In the Analytics section, users can track historical pollution trends over time. We can toggle between hourly and daily views, switch between PM2.5, PM10, or NO₂, and view statistical averages and peaks."* |
| **1:30 – 1:50** | **Location Comparison** | *[Navigate to `/comparison`]* *"The Location Comparison tool lets users evaluate up to 4 locations side-by-side. Our multi-axis radar chart and comparison table highlight which city has cleaner air, helping travelers and residents make informed plans."* |
| **1:50 – 2:10** | **Health Insights & 5-Day Forecast** | *[Show `/health` then `/forecast`]* *"Our Health & Safety section provides actionable guidance on exercise, mask usage, and ventilation, with specific recommendations for vulnerable groups like children and asthma patients. On the Forecast page, we integrate Open-Meteo to show 5-day predictive trends — clearly labeled as model forecasts, not ground measurements."* |
| **2:10 – 2:30** | **Bonus Features & Conclusion** | *[Show `/clean-air` and `/assistant`]* *"Finally, our Clean Air Finder ranks nearby areas to find cleaner air zones, and our AI Assistant helps users understand environmental questions in simple language. BreatheIQ was built with Next.js, TypeScript, and open APIs. Thank you for watching!"* |

---

## 4. Deployment Instructions (Vercel)

1. Push your code to your GitHub account:
   ```bash
   node scripts/git-push.mjs https://github.com/<your-username>/breatheiq.git <your-github-token>
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your **`breatheiq`** repository.
4. Add the environment variable:
   - `OPENAQ_API_KEY`: *(Optional, your OpenAQ v3 key)*
5. Click **Deploy**. Vercel will build and assign you a live production URL (e.g., `https://breatheiq.vercel.app`).
