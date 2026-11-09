# 🌿 BreatheIQ

> **Understand Your Air. Protect Your Health.**

A real-time Air Quality Intelligence Platform built for the **Let's Code Diwali Challenge 2026** (Theme: *Technology for Cleaner Air*).

![BreatheIQ Banner](public/globe.svg)

---

## 📖 Overview

Air pollution is one of the most critical environmental and public health challenges globally. Yet, existing air quality data is often fragmented across multiple platforms, difficult for the general public to interpret, or presents raw concentrations as arbitrary index numbers without standard scientific backing.

**BreatheIQ** bridges this gap by transforming complex environmental data from authoritative public monitoring networks into simple, understandable, and actionable intelligence.

---

## ✨ Features

### 🏛️ Six Mandatory Challenge Features

1. **Live AQI Dashboard (`/`)**
   - Live Air Quality Index calculated strictly using the **US-EPA standard (2018 Technical Assistance Document)** breakpoints and formulas.
   - Comprehensive multi-pollutant monitoring: **PM2.5, PM10, NO₂, SO₂, CO, and O₃**.
   - Concentration units, pollutant health severity badges, safe thresholds, and data freshness indicators.
   - Ground-level station discovery and interactive location search via OpenStreetMap Nominatim.

2. **Interactive Air Quality Map (`/map`)**
   - Full-screen interactive map built with **React Leaflet** and **OpenStreetMap**.
   - Stations rendered as color-coded severity markers (low, moderate, high, very high).
   - Clickable popups displaying live station metadata, individual pollutant measurements, timestamps, and data sources.

3. **Historical Pollution Tracker (`/analytics`)**
   - Time-series analytics with daily and hourly resolution.
   - Interactive line and bar charts using **Recharts**.
   - Pollutant selector for PM2.5, PM10, NO₂, and O₃ with statistical metrics (average, maximum, minimum).

4. **Location Comparison (`/comparison`)**
   - Side-by-side comparison of up to 4 locations simultaneously.
   - Multi-metric comparative radar chart visualizing relative pollutant burdens.
   - Side-by-side AQI gauge cards and pollutant comparison table with best-in-class highlights.

5. **Health & Safety Insights (`/health`)**
   - Tiered activity guidance (outdoor activities, vigorous exercise, indoor ventilation).
   - Dedicated guidance for vulnerable populations (children, elderly, respiratory conditions, heart disease, pregnant individuals, outdoor workers).
   - In-depth scientific explainers for all 6 criteria air pollutants (origin, biological impact, common sources).
   - Transparent disclaimer clarifying educational use vs. medical advice.

6. **Air Quality Forecast (`/forecast`)**
   - 5-day predictive air quality forecast powered by the **Open-Meteo Air Quality API**.
   - 72-hour hourly forecast area chart and daily average summary cards.
   - Prominently labeled as model-based forecast data to avoid conflating forecasts with ground-truth station observations.

---

### 🎁 Implemented Bonus Features

- **Multi-API Integration:** Real-time ground monitoring from **OpenAQ v3**, predictive atmospheric modeling from **Open-Meteo**, and spatial geocoding from **OpenStreetMap**.
- **Location-Based AQI & Clean Air Finder (`/clean-air`):** Discovers and ranks nearby air monitoring stations by lowest measured PM2.5 concentrations to identify relatively cleaner air zones.
- **AI / Environmental Assistant (`/assistant`):** Intelligent contextual assistant utilizing live API telemetry to answer environmental queries, explain pollutants, and advise on protective actions without fabricating data.
- **Smart AQI In-App Alerts (`/alerts`):** Configurable pollutant thresholds with local storage persistence and threshold crossing alerts against WHO air quality guidelines.
- **Dark & Light Mode Support:** Bespoke Dark Navy (`#0f172a`) and Light themes with dynamic switching.

---

## 📐 Scientific AQI Calculation

BreatheIQ does not invent arbitrary scores. The AQI is calculated using the standard US-EPA piecewise linear interpolation formula:

$$I_p = \frac{I_{Hi} - I_{Lo}}{BP_{Hi} - BP_{Lo}} \times (C_p - BP_{Lo}) + I_{Lo}$$

Where:
- $I_p$: Air Quality Index for pollutant $p$
- $C_p$: Truncated concentration of pollutant $p$
- $BP_{Hi}$, $BP_{Lo}$: Concentration breakpoints corresponding to $I_{Hi}$ and $I_{Lo}$

The overall AQI is defined as the maximum index across all evaluated pollutants:
$$\text{AQI} = \max(I_{\text{PM2.5}}, I_{\text{PM10}}, I_{\text{NO2}}, I_{\text{SO2}}, I_{\text{CO}}, I_{\text{O3}})$$

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js (App Router), React, TypeScript, Tailwind CSS, Lucide React |
| **Data Visualization** | Recharts, SVG Gauge Graphics |
| **Mapping Engine** | React Leaflet, Leaflet, OpenStreetMap |
| **Backend & Routing** | Next.js Server Route Handlers, Node.js |
| **Data Sources** | OpenAQ API v3, Open-Meteo Air Quality API, Nominatim |
| **State & Storage** | React Context, LocalStorage |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node.js 22)
- npm or yarn

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/your-username/breatheiq.git
   cd breatheiq
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   Add your OpenAQ v3 API key:
   ```env
   OPENAQ_API_KEY=your_openaq_api_key_here
   ```
   *(Note: The platform works out of the box even without an API key by fetching Open-Meteo data and displaying labeled demo stations for locations without API credentials).*

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🛡️ License & Attributions

- Map data © [OpenStreetMap](https://www.openstreetmap.org) contributors.
- Ground station observations courtesy of [OpenAQ](https://openaq.org).
- Atmospheric forecast data courtesy of [Open-Meteo](https://open-meteo.com).
- Developed for the **Let's Code Diwali Challenge 2026**.
