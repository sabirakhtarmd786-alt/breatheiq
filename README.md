# BreatheIQ — Real-Time Air Quality Intelligence Platform

> **Tagline:** Understand Your Air. Protect Your Health.  
> **Challenge:** Let's Code Diwali Challenge 2026  
> **Theme:** Technology for Cleaner Air  
> **Developer:** 2nd-Year Computer Science & Engineering (IoT) Student  

---

## 🌟 Executive Summary

Air pollution is an urgent environmental and public health crisis. During the post-monsoon and Diwali festival season across the Indian subcontinent and global metropolitan basins, stagnant atmospheric thermal inversions trap combustion particulates near ground level, exposing millions to hazardous concentrations of fine soot ($PM_{2.5}$), coarse dust ($PM_{10}$), nitrogen dioxide ($NO_2$), and sulfur dioxide ($SO_2$).

Most public dashboards present scattered, raw numerical readings that ordinary citizens find confusing. **BreatheIQ** bridges this gap by transforming raw atmospheric data into simple, actionable, and life-saving environmental intelligence.

---

## 🏆 Challenge Compliance Checklist

### ✅ All 6 Mandatory Challenge Features Fully Implemented

| # | Mandatory Feature | Implementation & Technical Architecture |
| :--- | :--- | :--- |
| **1** | **Live AQI Dashboard** | Real-time monitoring of all 6 criterion pollutants ($PM_{2.5}, PM_{10}, NO_2, SO_2, CO, O_3$), animated SVG radial gauge, dominant pollutant identification, EPA standard compliance, atmospheric dispersion index, and 24-hr diurnal sparklines. |
| **2** | **Interactive Air Quality Map** | **3-Tier Hierarchical Drilldown Map of India**: All 28 States & 8 UTs colored by AQI $\to$ click a state to zoom into Cities $\to$ zoom further into precision ground monitoring stations (CPCB, DPCC, SAFAR, MPCB, KSPCB) with popup telemetry. |
| **3** | **Historical Pollution Tracker** | Multi-pollutant time-series analysis (7-day, 14-day, 30-day), daily aggregate bar charts, period-over-period comparative delta ($\Delta\%$), diurnal hourly peak analysis, and one-click CSV dataset export. |
| **4** | **Location Comparison** | Side-by-side multi-city comparison matrix (e.g. New Delhi vs Mumbai vs Bengaluru) with normalized criteria pollutant bar charts and transparent clean-air identification. |
| **5** | **Health & Safety Hub** | Actionable medical guidance for vulnerable groups (Asthma/COPD, Cardiovascular, Children, Elderly, Pregnancy), certified PPE & Mask Selector (N95/KN95 vs Surgical vs Cloth), indoor HEPA air filtration guidelines, and chemical pollutant profiles. |
| **6** | **Air Quality Forecast** | 7-day predictive atmospheric simulation from European Copernicus (CAMS) models, 48-hour hourly predictive curves, and optimal outdoor activity time-window recommendations. |

### 🚀 Bonus Features Implemented & Accessible

- **Multi-API Hybrid Integration**: Open-Meteo European CAMS Atmospheric Service, Open-Meteo Geocoding, OpenStreetMap & CARTO vector tiles, and OpenAQ API v3.
- **Location-Based Detection**: HTML5 Geolocation API with user permission handling and reverse geocoding fallback.
- **Clean Air Finder**: Spherical Haversine distance ranking identifying the closest low-pollution havens with scientific rationales.
- **Context-Grounded AI Assistant**: Interactive conversational environmental assistant grounded directly in live local sensor telemetry.
- **Smart AQI Alerts**: Configurable pollutant threshold sliders, browser push notifications, and in-app alert history.
- **AQI Social Share Cards**: Branded exportable summary cards with clipboard copy and print report capabilities.

---

## 📐 Documented AQI Standard & Formulation

BreatheIQ strictly complies with the **United States Environmental Protection Agency (US EPA) Air Quality Index standard** (Title 40, Code of Federal Regulations, Part 58, Appendix G).

Raw pollutant concentrations are **never treated as AQI scores directly**. Sub-indices are calculated using piecewise linear interpolation across official federal breakpoints:

$$I_p = \text{round}\left( \frac{I_{Hi} - I_{Lo}}{BP_{Hi} - BP_{Lo}} (C_p - BP_{Lo}) + I_{Lo} \right)$$

Where:
- $I_p$ = Calculated Air Quality Index for pollutant $p$
- $C_p$ = Truncated/rounded concentration of pollutant $p$
- $BP_{Hi}$ = Breakpoint concentration greater than or equal to $C_p$
- $BP_{Lo}$ = Breakpoint concentration less than or equal to $C_p$
- $I_{Hi}$ = AQI value corresponding to $BP_{Hi}$
- $I_{Lo}$ = AQI value corresponding to $BP_{Lo}$

The overall composite AQI is defined as the maximum sub-index:
$$\text{Overall AQI} = \max\left(I_{PM2.5}, I_{PM10}, I_{O3}, I_{NO2}, I_{SO2}, I_{CO}\right)$$

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router with Server Components & Route Handlers)
- **Language**: TypeScript 5.6 (100% strict type-safety)
- **Styling**: Tailwind CSS 3.4 (Dark Navy `#060A17`, Emerald `#10B981`, and Teal `#14B8A6` design tokens)
- **Icons**: Lucide React
- **Data Visualization**: Recharts 2.13 (Area charts, bar charts, multi-pollutant line overlays)
- **Interactive Maps**: Leaflet 1.9 & React-Leaflet 4.2 with CARTO dark vector tiles
- **Data Feeds**:
  - Open-Meteo European Atmospheric Air Quality API (CAMS model estimates & forecasts)
  - Open-Meteo Geocoding API (Worldwide location search)
  - OpenStreetMap (Spatial geographical infrastructure)
  - OpenAQ API v3 (Direct ground-level monitoring stations)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18.17+ or v20 LTS
- npm or pnpm

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/breatheiq.git
   cd breatheiq
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (optional):
   ```bash
   cp .env.example .env.local
   ```
   Add your optional OpenAQ API key or Gemini API key if desired:
   ```env
   OPENAQ_API_KEY=your_openaq_api_key_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🎥 2–3 Minute Demonstration Video Script

- **0:00 – 0:20 | Introduction & Problem Statement**: Introduce BreatheIQ, the Diwali pollution challenge, and the importance of converting complex environmental numbers into actionable intelligence.
- **0:20 – 0:45 | Live AQI Dashboard**: Showcase the animated radial gauge, real-time US EPA standard calculation, criteria pollutant cards ($PM_{2.5}, PM_{10}, NO_2$), and atmospheric dispersion index.
- **0:45 – 1:10 | 3-Tier India Map Drilldown**: Demonstrate national state-level AQI color coding $\to$ click Delhi or Maharashtra to zoom into cities $\to$ zoom further to inspect Anand Vihar or BKC precision ground monitoring stations.
- **1:10 – 1:30 | Historical Pollution Analytics**: Explore 7/14/30-day time-series, period-over-period comparative improvement/worsening rates, and diurnal peak rush-hour analysis.
- **1:30 – 1:50 | Multi-Location Comparison & Clean Air Finder**: Compare New Delhi vs Mumbai vs Bengaluru side-by-side, then use Clean Air Finder to locate the nearest low-AQI sanctuary via Haversine distance.
- **1:50 – 2:10 | Health Guidance & 7-Day Forecast**: Demonstrate the sensitive groups advisory, certified N95 mask comparison, and the 7-day Copernicus atmospheric forecast.
- **2:10 – 2:30 | AI Assistant & Challenge Closing**: Ask the contextual AI assistant about running safety in high PM2.5, generate a branded AQI share card, and conclude with the platform's vision for cleaner air.

---

## 📄 License & Attribution

Developed with pride for the **Let's Code Diwali Challenge 2026**.  
Public atmospheric data provided by **Open-Meteo**, the **European Copernicus Atmosphere Monitoring Service (CAMS)**, **OpenAQ**, and **OpenStreetMap**.
