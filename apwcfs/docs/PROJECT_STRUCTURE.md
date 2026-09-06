# Project Structure — APWCFS

### Air Pollution & Weather Coupled Forecasting System
**Team:** Unhandled Exceptions | **SIH 26082**

---

```text
apwcfs-main/
│
├── .env                                  # Root environment variables
├── .gitignore                            # Git exclusion rules
├── README.md                             # Comprehensive project overview & quick start
├── UNDERSTANDING.md                      # Scientific foundation & coupling paradigm
├── TODO.md                               # Milestones, completed items & future roadmap
├── SIH 26082.pptx                        # SIH Presentation Deck (Kept intact in root)
│
├── old_version/                          # ARCHIVED REDUNDANT VERSIONS & DUMPS
│   ├── frontend/                         # Legacy Next.js initial draft
│   ├── x-dump/                           # Legacy dump folder & duplicate copies
│   ├── concept.md                        # Initial concept diagram sketch
│   ├── tree.md                           # Legacy directory dump
│   └── project_roles_and_system_architecture.md # Legacy roles document
│
├── apwcfs/                               # ACTIVE APPLICATION DIRECTORY
│   ├── .env                              # Local active API keys (WAQI, Gemini)
│   ├── index.html                        # Application HTML shell (Title: Unhandled Exceptions)
│   ├── package.json                      # Dependencies (React 19, Leaflet, Vite, etc.)
│   ├── vite.config.js                    # Vite bundler configuration
│   │
│   ├── src/
│   │   ├── App.jsx                       # Root router & layout container
│   │   ├── main.jsx                      # React application bootstrap
│   │   ├── index.css                     # Design system (Glassmorphism, animations, responsive)
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.jsx                # Dynamic adjusting header with scroll detection & pills
│   │   │   └── Map.jsx                   # Leaflet geospatial heatmap (MapComponent)
│   │   │
│   │   └── pages/
│   │       ├── Home.jsx                  # Landing page & SIH problem context
│   │       ├── Science.jsx               # Meteorology-chemistry coupling explanation
│   │       └── Dashboard.jsx             # Core telemetry, XAI engines, & modal portal
│   │
│   └── dist/                             # Compiled production bundle
│
└── docs/                                 # TECHNICAL DOCUMENTATION SUITE
    ├── ARCHITECTURE.md                   # System architecture & component design
    ├── API_SPEC.md                       # Ingested APIs & Gemini prompt schemas
    ├── DATA_PIPELINE.md                  # Telemetry ingestion, validation & synthesis
    ├── XAI.md                            # Explainable AI & local physics engine specification
    ├── PROJECT_STRUCTURE.md              # Codebase layout & file guide
    └── VALIDATION.md                     # Testing, benchmarking & verification guide
```
