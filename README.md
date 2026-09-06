# APWCFS — Air Pollution & Weather Coupled Forecasting System

### Smart India Hackathon (SIH 26082)
**Team:** Unhandled Exceptions  
**Ministry:** Ministry of Earth Sciences (MoES)  
**Organization:** National Centre for Medium Range Weather Forecasting (NCMRWF)  
**Domain:** Software → Clean & Green Technology  
**Region:** Delhi NCR (Subcontinental High-Resolution Bounding Basin)

---

> [!IMPORTANT]
> ### 📖 Primary Project Documentation & Source Code
> The complete, active application and main documentation are located in the **[`apwcfs/`](./apwcfs)** directory:
> 
> 👉 **[Click here to view the Main Technical Documentation (`apwcfs/README.md`)](./apwcfs/README.md)**
> 
> All source code, dependencies, environment configurations, and technical docs are self-contained inside **`apwcfs/`**.

---

## ⚡ Quick Navigation to Main References

| Document | Direct Link | Description |
| :--- | :--- | :--- |
| 📘 **Primary README** | **[`apwcfs/README.md`](./apwcfs/README.md)** | **Main project documentation**, architecture diagrams, and quick-start. |
| 🔬 **Coupling Science** | **[`apwcfs/UNDERSTANDING.md`](./apwcfs/UNDERSTANDING.md)** | Scientific foundation of Weather ↔ Chemistry coupling ($C \propto E / (h \cdot u)$). |
| 🏗️ **System Architecture** | **[`apwcfs/docs/ARCHITECTURE.md`](./apwcfs/docs/ARCHITECTURE.md)** | Deep dive into the 3 decoupled architectural layers. |
| 📡 **API Specifications** | **[`apwcfs/docs/API_SPEC.md`](./apwcfs/docs/API_SPEC.md)** | WAQI ground truth, Open-Meteo WRF-Chem satellite proxies & Gemini schemas. |
| 🧪 **Data Pipeline** | **[`apwcfs/docs/DATA_PIPELINE.md`](./apwcfs/docs/DATA_PIPELINE.md)** | Ingestion flow, Haversine validation ($<25\text{km}$) & satellite synthesis formulas. |
| 🤖 **Explainable AI (XAI)** | **[`apwcfs/docs/XAI.md`](./apwcfs/docs/XAI.md)** | Gemini Flash real-time streaming & Deterministic Local Physics Engine rules. |
| 📊 **SIH Presentation** | **[`apwcfs/SIH 26082.pptx`](./apwcfs/SIH%2026082.pptx)** | Official SIH presentation slide deck. |
| 📋 **Project Roadmap** | **[`apwcfs/TODO.md`](./apwcfs/TODO.md)** | Completed milestones and future HPC backend extensions. |

---

## 🚀 Quick Start (Running the Active Instance)

```bash
# 1. Navigate to the active application directory
cd apwcfs

# 2. Install dependencies (if not already installed)
npm install

# 3. Launch development server
npm run dev
```

The application will be live at **`http://localhost:5173`** (or `http://localhost:5173/dashboard`).

---

## 📁 Repository Layout

```text
apwcfs-main/
│
├── README.md                      # 📍 This Navigation Pointer
│
├── apwcfs/                        # 🟢 ACTIVE PRODUCTION INSTANCE (Main Reference)
│   ├── README.md                  # 📖 MAIN TECHNICAL DOCUMENTATION
│   ├── SIH 26082.pptx             # Official SIH Presentation Slide Deck
│   ├── .env                       # Active API keys (WAQI, Gemini)
│   ├── .gitignore                 # Active Git exclusion rules
│   ├── UNDERSTANDING.md           # Scientific coupled modeling documentation
│   ├── TODO.md                    # Project roadmap & milestones
│   ├── docs/                      # Full 10-document technical specifications suite
│   ├── src/                       # React 19 application source code
│   └── package.json               # Dependencies and scripts (dev, build)
│
└── old_version/                   # 📦 ARCHIVED LEGACY DRAFTS & BACKUPS
    ├── frontend/                  # Legacy initial Next.js draft
    ├── x-dump/                    # Legacy dump folder & duplicate checklists
    └── root_files/                # Root file backups
```
