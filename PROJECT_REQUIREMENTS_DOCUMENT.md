# Project Requirements Document
## TransparenSee â€” AI-Powered MPLADS Monitoring Platform
### Team Outlier Ops Â· Smart India Hackathon 2026

---

**Problem Statement:** Development of an AI-powered system to detect anomalies, fraud, and inefficiencies in MPLAD Scheme implementation
**Organisation:** MoSPI â€” Data Informatics & Innovation Division (DIID)
**Category:** Software Â· Theme: Smart Automation
**Dataset:** https://mplads.mospi.gov.in/digigov/dashboard.html
**Document version:** 1.0
**Date:** 31 August 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Stakeholders](#2-stakeholders)
3. [System Architecture](#3-system-architecture)
4. [Module Breakdown](#4-module-breakdown)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Requirements](#7-data-requirements)
8. [AI / ML Requirements](#8-ai--ml-requirements)
9. [Dashboard Requirements](#9-dashboard-requirements)
10. [Tech Stack](#10-tech-stack)
11. [Current Implementation Status](#11-current-implementation-status)
12. [Open Gaps â€” What the Team Must Build](#12-open-gaps--what-the-team-must-build)
13. [Task Assignment by Role](#13-task-assignment-by-role)
14. [Definition of Done](#14-definition-of-done)

---

## 1. Project Overview

The Members of Parliament Local Area Development Scheme (MPLADS) allocates â‚¹5 crore per MP per year for local development works. With 764 MPs across 36 states and UTs recommending thousands of works annually, manual monitoring is infeasible.

**TransparenSee** is an AI-powered web platform that analyses MPLADS data published on the MoSPI eSAKSHI portal to:

- Detect anomalies, irregularities, and potential misuse patterns automatically
- Score every work, MP portfolio, and vendor on a 0â€“100 risk scale with a plain-language explanation
- Surface high-risk cases into an investigation queue for authorised human review
- Provide role-based dashboards for MPs, State/District Authorities, and the Ministry

> **Design principle:** The system assists human investigation. It never declares fraud. A high risk score means "this record warrants closer look", not "this is fraudulent."

---

## 2. Stakeholders

| Stakeholder | Role in System | Primary Need |
|---|---|---|
| **Ministry (MoSPI/DIID)** | Admin / oversight | National overview, compliance reporting, audit trail |
| **State Nodal Authorities** | State-level reviewer | State roll-up, district comparison, high-risk works in their state |
| **District Authorities** | Field-level reviewer | Works in their district, vendor patterns, field verification prompts |
| **Members of Parliament** | Portfolio owner | Their own works' risk status, corrective action recommendations |
| **Auditors** | Read-only analyst | Risk register, alert history, data lineage |
| **System Developers (Team Outlier)** | Builders | This document |

---

## 3. System Architecture

```
Official MoSPI eSAKSHI Portal (JSON API)
          â”‚
          â–¼
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚  Data Pipeline  â”‚  Python Â· runs nightly via scheduler
  â”‚  (AiModel/)     â”‚  Ingest â†’ Validate â†’ Clean â†’ Transform
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
           â–¼
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚    Warehouse    â”‚  SQLite (dev) / PostgreSQL (prod)
  â”‚  (SQLAlchemy)   â”‚  11 tables, full provenance per row
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜
           â”‚
     â”Œâ”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”
     â–¼            â–¼
  AI Engine    FastAPI
  (ML models,  REST API
  risk engine, (20+ endpoints,
  alerts)      role-based auth)
                   â”‚
                   â–¼
         â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
         â”‚  Next.js        â”‚
         â”‚  Frontend       â”‚  Dashboards for all stakeholders
         â”‚  (TransparenSee)â”‚
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### Three codebases in this repo

| Folder | Language | Purpose | Status |
|---|---|---|---|
| `frontend/` | TypeScript Â· Next.js 16 | UI dashboards | Running on port 3000 |
| `backend/` | Node.js Â· Express 5 | BFF / Auth gateway | Scaffold only (WIP) |
| `AiModel/mplads-ai-monitor/` | Python 3.12 | Data pipeline + ML + API | Built, needs dependencies |

---

## 4. Module Breakdown

### 4.1 Data Engineering (`AiModel/data_engineering/`)

| Sub-module | What it does |
|---|---|
| `ingestion/` | Pulls all 5 datasets from MoSPI eSAKSHI portal with retry/backoff; falls back to local snapshot if portal is unreachable |
| `validation/` | Runs 13 rule families (required fields, types, ranges, duplicates, domains); quarantines failures without deleting |
| `cleaning/` | Standardises state names, MP names, vendor names, categories, currencies; classifies missing values â€” never imputes |
| `transformation/` | Computes peer statistics (median, MAD, robust-z) within (state Ã— category), district, and national groups |
| `integration/` | Joins all datasets on the conformed MP key (name + state + house) |

### 4.2 AI / ML Engine

| Module | Algorithm | File |
|---|---|---|
| Anomaly Detection | Isolation Forest + LOF + DBSCAN + Robust Statistics rules | `anomaly_detection/detectors.py` |
| NLP Duplicate Detection | Character n-gram TF-IDF (3â€“5) cosine similarity | `nlp/duplicate_detection.py` |
| Completion Propensity | HistGradientBoostingClassifier | `prediction/models.py` |
| Risk Engine | 6-component weighted formula (0â€“100) | `risk_engine/engine.py` |
| Alert Engine | Threshold-based, lifecycle managed | `alerts/alert_engine.py` |

### 4.3 REST API (`AiModel/backend/api/main.py`)

FastAPI application â€” 20+ endpoints, API-key auth with 3 roles (viewer / analyst / admin).

### 4.4 Frontend (`frontend/`)

Next.js 16 + React 19 + TypeScript + Tailwind CSS + Recharts + Leaflet

### 4.5 Node.js Backend (`backend/`)

Express 5 â€” intended as a BFF (Backend-for-Frontend) handling session auth before proxying to FastAPI.

---

## 5. Functional Requirements

### FR-01 â€” Data Ingestion

- **FR-01.1** System must ingest all 5 official MPLADS datasets from the MoSPI eSAKSHI portal: `recommended_works`, `completed_works`, `expenditures`, `mp_summary`, `national_summary`
- **FR-01.2** Each ingestion run must record a SHA-256 hash, source URL, timestamp, record count, and schema for every dataset
- **FR-01.3** If the live portal is unreachable, the pipeline must fall back to the latest local snapshot and record the fallback in the manifest
- **FR-01.4** Raw data must never be overwritten or deleted

### FR-02 â€” Anomaly Detection

- **FR-02.1** System must detect works whose cost is statistically unusual compared with peer works in the same state and category (robust z-score, IQR fences)
- **FR-02.2** System must detect works whose cost is unusual within their implementing district
- **FR-02.3** System must run multivariate anomaly detection using Isolation Forest across amount, peer deviation, repetition, and timing features
- **FR-02.4** System must run density-based anomaly detection (LOF) to catch works that are locally unusual even if globally normal
- **FR-02.5** System must run explicit rule-based detection for: repeated identical payment lines, round-number bias, single-vendor district capture, long-open works, and incomplete records
- **FR-02.6** No single detector may independently determine a risk score â€” the ensemble of all detectors votes

### FR-03 â€” Duplicate Work Detection

- **FR-03.1** System must compare work descriptions within each state and district using NLP similarity
- **FR-03.2** Similarity threshold must be configurable (default 85%)
- **FR-03.3** Every detected duplicate pair must carry a written explanation and a similarity score
- **FR-03.4** The system must acknowledge that repeated descriptions can be legitimate (e.g., 20 street-light installations) and weight the duplicate risk higher when the same MP recommends near-identical works at similar amounts

### FR-04 â€” Delay and Progress Analysis

- **FR-04.1** System must compute how long each open work has been pending relative to the median age of completed works
- **FR-04.2** System must score open works on how closely they resemble works that have been completed (completion propensity model)
- **FR-04.3** System must flag works open significantly longer than the typical completion age

### FR-05 â€” Contractor / Vendor Risk

- **FR-05.1** System must compute vendor concentration (HHI) within each district
- **FR-05.2** System must flag vendors that dominate a district's payment value beyond a configurable threshold
- **FR-05.3** System must detect vendors with burst payment patterns (many lines per active day)
- **FR-05.4** System must detect vendors funded almost entirely by a single MP
- **FR-05.5** System must detect repeated identical payment lines (same vendor, same amount, same date)

### FR-06 â€” Fund Utilisation Analysis

- **FR-06.1** System must compute each MP's fund utilisation percentage and compare it nationally
- **FR-06.2** System must flag MPs with very low utilisation (below configurable threshold)
- **FR-06.3** System must detect discrepancies between the portal's published expenditure figure and the sum of its own payment lines
- **FR-06.4** System must track the share of payment lines still in "in-progress" status

### FR-07 â€” Risk Scoring

- **FR-07.1** Every work must receive a composite 0â€“100 risk score combining 6 independently explainable components:

  | Component | Default Weight | Measures |
  |---|---|---|
  | `cost_risk` | 0.24 | Deviation from comparable works |
  | `duplicate_risk` | 0.22 | Textual repetition against peers |
  | `vendor_risk` | 0.20 | Payment concentration |
  | `delay_risk` | 0.14 | Age relative to completed works |
  | `utilisation_risk` | 0.12 | MP's fund behaviour |
  | `data_quality_risk` | 0.08 | Incompleteness and inconsistency |

- **FR-07.2** Weights, thresholds, and band cut-offs must be configurable via `config/config.yaml` without code changes
- **FR-07.3** Risk bands: LOW (0â€“24) Â· MODERATE (25â€“49) Â· HIGH (50â€“74) Â· CRITICAL (75â€“100)
- **FR-07.4** Every scored record must carry a plain-English explanation quoting the actual numbers behind it
- **FR-07.5** MPs and vendors must also be scored using aggregated versions of the same components
- **FR-07.6** The system must also be able to score a proposed (not yet published) work against the existing population via the `/api/score` endpoint

### FR-08 â€” Alerts and Early Warning

- **FR-08.1** Alerts must be automatically raised for works, MP portfolios, and vendors that breach a configurable risk threshold (default: 60/100)
- **FR-08.2** Each alert must carry: what was detected, recommended action for the reviewer, severity band, and the entity it relates to
- **FR-08.3** Alerts must support a review lifecycle: `OPEN â†’ UNDER_REVIEW â†’ VERIFIED / FALSE_POSITIVE â†’ RESOLVED`
- **FR-08.4** Every status change must be recorded in an immutable `alert_history` table with actor, timestamp, and note
- **FR-08.5** Alert IDs must be deterministic â€” the same entity keeps the same alert ID across pipeline runs

### FR-09 â€” Dashboards

- **FR-09.1** Overview Dashboard â€” national KPIs, risk distribution chart, state/district breakdown, recent high-risk flags
- **FR-09.2** Investigation Queue â€” filterable, sortable list of all flagged works with risk band, state, category, amount, status
- **FR-09.3** Map View â€” geographic distribution of works with risk-band colour coding (state/district level)
- **FR-09.4** Work Detail Page â€” full record, 6 component scores, peer comparison, similar works, contractor history, and plain-English explanation
- **FR-09.5** MP Portfolio Page â€” utilisation vs completion scatter, top works by risk, vendor concentration, portfolio explanation
- **FR-09.6** Vendor Page â€” payment profile, concentration flags, district presence
- **FR-09.7** Alerts Page â€” triage queue with lifecycle controls
- **FR-09.8** Data Quality Page â€” per-run metrics, validation issues, reconciliation against MoSPI control totals

### FR-10 â€” Role-Based Access Control

- **FR-10.1** Three roles: `viewer` (read-only) Â· `analyst` (can update alert status) Â· `admin` (full access)
- **FR-10.2** MPs should see only their own constituency's works by default
- **FR-10.3** State Authorities should see only works in their state by default
- **FR-10.4** District Authorities should see only works in their district by default
- **FR-10.5** Ministry/Admin role sees all data

### FR-11 â€” Report Generation

- **FR-11.1** Authorised users must be able to export a risk register report for any filtered view
- **FR-11.2** Report must include: filter criteria, risk summary, table of flagged works, and a disclaimer that scores are indicators not determinations

### FR-12 â€” Auditability and Lineage

- **FR-12.1** Every analytical row in the warehouse must carry `run_id`, `risk_engine_version`, `feature_version`, and `model_version`
- **FR-12.2** A full lineage chain must be queryable: source bytes â†’ ingestion â†’ validation â†’ cleaning â†’ features â†’ risk score â†’ alert
- **FR-12.3** The system must reconcile against the 13 national control totals published by MoSPI and report any mismatch

---

## 6. Non-Functional Requirements

| ID | Requirement | Target |
|---|---|---|
| NFR-01 | API response time (works list) | < 500ms for up to 10,000 records |
| NFR-02 | Full pipeline runtime | < 30 minutes for the full 126k-record dataset |
| NFR-03 | Dashboard initial load | < 3 seconds |
| NFR-04 | Availability | 99% uptime during demo and evaluation window |
| NFR-05 | Security â€” SQL injection | All API parameters bound, never string-formatted |
| NFR-06 | Security â€” authentication | API-key auth on all endpoints; no anonymous write access |
| NFR-07 | Security â€” prompt injection | NL assistant input filtered before processing |
| NFR-08 | Explainability | No score in the system may be presented without a written explanation |
| NFR-09 | No false fraud claims | No explanation anywhere may contain the word "fraud" as a determination |
| NFR-10 | Reproducibility | Same input data must produce the same risk scores across runs |
| NFR-11 | Deployability | Full stack must run with `docker compose up --build` |
| NFR-12 | Configurability | All thresholds and weights must be changeable via config.yaml without code changes |

---

## 7. Data Requirements

### Official datasets (all from MoSPI eSAKSHI portal)

| Dataset | Records (Aug 2026 snapshot) | Key fields |
|---|---|---|
| `recommended_works` | 83,621 | Work ID, MP name, state, district, category, amount, date, implementing agency, description |
| `completed_works` | 43,173 | Work ID, MP name, state, category, completion amount, completion date |
| `expenditures` | 106,263 | MP name, vendor, agency, amount, date, payment status |
| `mp_summary` | 764 | MP name, house, state, constituency, allocated amount, expenditure, utilisation% |
| `national_summary` | 1 | National control totals (13 figures for reconciliation) |

### Data quality thresholds (configured, not hardcoded)

- Overall data quality target: â‰¥ 95%
- Reconciliation against MoSPI control totals: 100% (zero tolerance for unexplained gaps)

### What the data does NOT contain (hard limitations)

| Missing field | Impact |
|---|---|
| GPS coordinates | Map view is administrative only (state/district), no point map |
| Work lifecycle join (recommendation â†” completion) | Per-work duration and cost-overrun analysis are impossible |
| Payment identifiers | Repeated identical payment lines cannot be definitively resolved |
| Fraud labels | Supervised fraud classification is impossible and must not be attempted |
| Contractor registration numbers | Vendor identity relies on name normalisation only |

---

## 8. AI / ML Requirements

### Models to implement

| Model | Type | Purpose | Minimum performance target |
|---|---|---|---|
| **Isolation Forest** | Unsupervised | Multivariate anomaly detection on works and payments | Contamination rate from EDA |
| **Local Outlier Factor** | Unsupervised | Density-based anomaly detection | Agreement â‰¥ 0.60 with IF on high-risk records |
| **DBSCAN** | Unsupervised | Cluster-noise detection | â‰¥ 5% noise rate on anomalous population |
| **Completion Propensity** | Supervised classifier | Predict whether open work resembles completed works | ROC-AUC â‰¥ 0.80 |
| **TF-IDF Duplicate Detector** | NLP | Find near-duplicate work descriptions | Precision â‰¥ 0.85 on manually verified pairs |

### Models explicitly NOT to build

| Model | Reason |
|---|---|
| Expected completion time | No per-work start+end dates in source |
| Cost overrun probability | Only one amount per work published |
| Payment failure probability | No failure events in source data |
| Fraud probability | No confirmed fraud labels exist |

### Feature engineering (40 features across 3 grains)

All features are documented in `ml/feature_engineering/features.py â†’ FEATURE_DOCS`. Key feature groups:

- **Work-level (20 features):** log amount, peer-group z-scores and ratios, age metrics, description quality, round-number bias, duplicate counts, data completeness
- **Vendor-level (11 features):** payment volume, concentration (HHI, district share, MP dependency), repeat-line share, burst-payment rate
- **MP-level (9 features):** unspent %, pending payment share, published-vs-derived gap, top-vendor share, HHI, duplicate work share

### Leakage controls

- No time features in the propensity model (completion date leaks the label)
- No risk scores as model inputs (downstream of models)
- Train/test split by MP group so no constituency appears on both sides

---

## 9. Dashboard Requirements

### Pages required

| Page | Route | Priority |
|---|---|---|
| Overview Dashboard | `/` | P0 |
| Investigation Queue | `/queue` | P0 |
| Map View | `/map` | P0 |
| Work Detail | `/work/[id]` | P1 |
| MP Portfolio | `/mp/[id]` | P1 |
| Alerts | `/alerts` | P1 |
| Vendor Profile | `/vendor/[id]` | P2 |
| Data Quality | `/quality` | P2 |
| Report Export | `/report` | P2 |

### UI/UX requirements

- Must be usable by non-technical government officials â€” no jargon, plain language throughout
- Every risk score must show its band (LOW/MODERATE/HIGH/CRITICAL) with a colour indicator
- Every flagged item must show "Why is this flagged?" in plain English
- Every page must show a disclaimer: "Risk indicators only â€” authorised human review required before action"
- Role selector must be visible on every page
- Must be responsive (works on laptop screens used in government offices)
- No dark mode required; government-appropriate colour palette

### Accessibility

- All interactive elements must have ARIA labels
- Colour is not the sole indicator of risk â€” always include text band label alongside colour
- Tables must have proper `role` and header associations

---

## 10. Tech Stack

### Frontend
| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js | 16.3.2 |
| UI library | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Charts | Recharts | 3.x |
| Maps | Leaflet + react-leaflet | 1.9.x / 5.x |
| Icons | lucide-react | 1.33.x |
| Dev server port | â€” | 3000 |

### Backend (Node.js BFF)
| Layer | Technology | Version |
|---|---|---|
| Framework | Express | 5.2.x |
| Process manager | nodemon | 3.x |
| Port | â€” | 6005 |

### AI Model & API (Python)
| Layer | Technology | Version |
|---|---|---|
| Language | Python | 3.12 |
| Data processing | pandas, numpy, scipy | â‰¥2.2 / â‰¥1.26 / â‰¥1.11 |
| ML | scikit-learn | â‰¥1.4 |
| NLP | scikit-learn TF-IDF | â€” |
| API framework | FastAPI | â‰¥0.110 |
| API server | uvicorn | â‰¥0.27 |
| ORM | SQLAlchemy | â‰¥2.0 |
| Database | SQLite (dev) / PostgreSQL (prod) | â€” |
| Model serialisation | joblib | â€” |
| Config | PyYAML | â‰¥6.0 |
| Testing | pytest | â‰¥8.0 |

### Infrastructure
| Component | Technology |
|---|---|
| Containerisation | Docker + Docker Compose |
| Services | postgres, pipeline, api, scheduler |
| Scheduler | Nightly pipeline re-run |

---

## 11. Current Implementation Status

### What is built and working

| Component | Status | Notes |
|---|---|---|
| Data ingestion (all 5 datasets) | âœ… Built | MoSPI snapshot dated 22 Aug 2026 on disk |
| Data validation (13 rule families) | âœ… Built | Quarantine pattern, no deletion |
| Data cleaning | âœ… Built | Standardisation complete, no imputation |
| Feature engineering (40 features) | âœ… Built | `ml/feature_engineering/features.py` |
| Anomaly detection ensemble | âœ… Built | IF + LOF + DBSCAN + rules |
| NLP duplicate detection | âœ… Built | 62,723 pairs detected at â‰¥85% similarity |
| Completion propensity model | âœ… Trained | ROC-AUC 0.87, saved to `scoring_pack.joblib` |
| Risk engine (6 components) | âœ… Built | Explainable, configurable weights |
| Alert engine | âœ… Built | 534 alerts in last run |
| FastAPI backend (20+ endpoints) | âœ… Built | Auth, rate limiting, SQL guard |
| Overview Dashboard UI | âœ… Running | Port 3000, mock data |
| Investigation Queue UI | âœ… Running | Filters working |
| Map View UI | âœ… Running | Leaflet, state/district level |
| Work detail components | âœ… Built | Components exist, page route missing |
| Nightly scheduler (Docker) | âœ… Built | docker-compose.yml |
| Test suite (4 files) | âœ… Built | Data, ML, risk, security, live-scoring tests |
| Node.js backend | âš ï¸ Scaffold | Returns WIP message only |
| Python dependencies | âŒ Not installed | pip install needed |
| Frontend â†” API connection | âŒ Not wired | Frontend reads mock data |
| Work detail route | âŒ Missing | Components exist, `app/work/[id]/page.tsx` not created |
| Role-based content gating | âŒ Not wired | Role selector is UI-only |
| Report generation | âŒ Not implemented | Button disabled ("coming soon") |
| Computer vision module | âŒ Not built | Planned, not started |

---

## 12. Open Gaps â€” What the Team Must Build

### GAP-01 Â· Frontend â†” AI API Integration (CRITICAL â€” P0)

**What:** The Next.js frontend currently reads from `frontend/data/works` â€” a static mock file. It must instead call the FastAPI endpoints.

**Endpoints to wire:**

| Frontend component | API endpoint |
|---|---|
| Overview KPI cards | `GET /api/kpis` |
| Risk distribution chart | `GET /api/kpis` |
| State/District table | `GET /api/states`, `GET /api/districts` |
| Investigation Queue | `GET /api/works?band=HIGH&state=...` |
| Map View | `GET /api/works` (lat/lng from district centroids) |
| Work Detail | `GET /api/works/{work_uid}` |
| Alerts page | `GET /api/alerts` |
| Alert status update | `PATCH /api/alerts/{id}` |
| MP Portfolio | `GET /api/mps/{mp_key}` |

**Who:** Frontend developer + Python/API developer (coordination needed)

---

### GAP-02 Â· Work Detail Page Route (HIGH â€” P1)

**What:** The components exist (`WorkHeader`, `KeyFactsPanel`, `WhyFlaggedSection`, `ActionChecklist`) but the page route is missing.

**Action:** Create `frontend/app/work/[id]/page.tsx` that fetches `/api/works/{id}` and renders the 4 components.

**Who:** Frontend developer

---

### GAP-03 Â· Node.js Backend â€” Auth Gateway (HIGH â€” P1)

**What:** The Express backend (`backend/index.js`) is a stub. It needs to:

1. Handle user login / session (JWT or session cookie)
2. Map user roles to API keys (viewer/analyst/admin)
3. Proxy requests to FastAPI with the appropriate `x-api-key` header

**Why not call FastAPI directly from the frontend:** API keys must not be exposed in browser JS. The Node.js BFF keeps them server-side.

**Who:** Backend developer

---

### GAP-04 Â· Python Dependencies Installation (HIGH â€” P1)

**What:** No Python packages are installed on the deployment machine. The pipeline, FastAPI API, and all ML models require packages from `requirements.txt`.

**Action:**
```bash
cd AiModel/mplads-ai-monitor
pip install -r requirements.txt
```

**Note:** The saved `scoring_pack.joblib` was built with sklearn 1.8.0. Once dependencies are installed, retrain by running:
```bash
python scripts/run_pipeline.py
```
This rebuilds the scoring pack with the installed sklearn version.

**Who:** DevOps / any team member with internet access

---

### GAP-05 Â· Role-Based Content Gating (MEDIUM â€” P1)

**What:** The Sidebar role selector currently changes a local React state variable only. It must:

1. Pass the selected role to the Node.js BFF
2. The BFF must filter API responses (MPs see only their works, state authorities see only their state, etc.)

**FastAPI already supports this** via role-based filtering on `/api/works?mp_key=...&state=...`

**Who:** Frontend developer + Backend developer

---

### GAP-06 Â· Contractor Risk Profile Page (MEDIUM â€” P2)

**What:** The problem statement explicitly asks for contractor performance analysis. Currently vendor risk is computed but there is no dedicated contractor profile page showing:

- Number of works associated with this contractor across MPs
- Delayed works count and rate
- Cost anomaly rate across their works
- Which MPs / districts they work in
- Risk trend over time

**Who:** Full-stack developer

---

### GAP-07 Â· Report Generation (MEDIUM â€” P2)

**What:** The "Generate Report" button in the TopBar is disabled. Required output:

- PDF or printable HTML report for the current filtered view
- Contents: filter criteria used, summary statistics, table of flagged works, component scores, and the standard disclaimer
- The AI model already produces `scripts/build_dashboard.py` which outputs a standalone HTML file â€” this can be adapted

**Who:** Frontend developer (PDF export via `window.print()` CSS or a library like `html2canvas`)

---

### GAP-08 Â· Computer Vision for Progress Verification (LOW â€” P3)

**What:** The problem statement mentions detecting mismatch between reported and observed progress via photographs. The `has_images` field exists in the data schema and scoring API but no CV module exists.

**Minimum viable implementation for the demo:**
- Image upload endpoint in FastAPI
- Compare uploaded "current state" photo against any prior images using pixel or feature similarity
- Flag if images for a work are duplicates of images from a different work (copy-paste fraud indicator)

**Who:** ML developer

---

### GAP-09 Â· District Centroid Coordinates for Map (LOW â€” P3)

**What:** The source data has no GPS coordinates. The map currently cannot plot individual works.

**Action:** Map district names to LGD (Local Government Directory) codes, then join to a district centroid lookup table to get approximate lat/lng for each work.

**LGD data:** Publicly available from `lgdirectory.gov.in`

**Who:** Data engineer

---

## 13. Task Assignment by Role

### Frontend Developer
- [ ] GAP-02: Create `app/work/[id]/page.tsx`
- [ ] GAP-01: Wire Overview, Queue, Map to FastAPI endpoints (after GAP-04 is done)
- [ ] GAP-05: Connect role selector to BFF
- [ ] GAP-07: Implement report export
- [ ] Fix: StateDrillTable key prop warning (already done in code, verify hot-reload)

### Backend Developer (Node.js)
- [ ] GAP-03: Implement JWT auth in Express, map roles to FastAPI API keys
- [ ] GAP-03: Implement proxy routes to FastAPI
- [ ] GAP-01: Coordinate with frontend on API contract

### Python / ML Developer
- [ ] GAP-04: Install Python dependencies (`pip install -r requirements.txt`)
- [ ] GAP-04: Retrain and verify scoring pack (`python scripts/run_pipeline.py`)
- [ ] GAP-04: Start FastAPI server (`uvicorn backend.api.main:app --reload`)
- [ ] GAP-06: Build contractor risk aggregation and API endpoint
- [ ] GAP-08: Computer vision module (P3)
- [ ] GAP-09: District centroid join (P3)

### DevOps / Any Team Member
- [ ] GAP-04: Ensure Python dependencies can be installed (internet access)
- [ ] Verify `docker compose up --build` works end-to-end
- [ ] Set up environment variables from `.env.example`

---

## 14. Definition of Done

A feature is **done** when:

1. The code is committed and pushed to the `TransparenSee` repository
2. The relevant page/endpoint returns real data (not mock data)
3. Every risk score shown in the UI has a visible explanation in plain English
4. The disclaimer "Risk indicators only â€” authorised human review required" is visible on every page that shows scores
5. No explanation in the system uses the word "fraud" as a determination
6. The feature works for all 5 roles (Ministry, State, District, MP, Auditor)
7. The build does not produce any TypeScript errors or Python exceptions in normal operation

---

## Appendix A â€” API Quick Reference

| Method | Route | Auth required | Purpose |
|---|---|---|---|
| GET | `/health` | None | Liveness check |
| GET | `/api/kpis` | Viewer | National KPIs |
| GET | `/api/states` | Viewer | State roll-ups |
| GET | `/api/districts` | Viewer | District roll-ups |
| GET | `/api/works` | Viewer | Works list (filterable) |
| GET | `/api/works/{uid}` | Viewer | Full work detail |
| GET | `/api/mps` | Viewer | MP list |
| GET | `/api/mps/{key}` | Viewer | MP portfolio |
| GET | `/api/vendors` | Viewer | Vendor list |
| GET | `/api/duplicates` | Viewer | Near-duplicate pairs |
| GET | `/api/alerts` | Viewer | Alert queue |
| PATCH | `/api/alerts/{id}` | Analyst | Update alert status |
| GET | `/api/alerts/{id}/history` | Viewer | Alert audit history |
| POST | `/api/score` | Analyst | Score a proposed work |
| POST | `/api/score/batch` | Analyst | Score up to 200 works |
| GET | `/api/data-quality` | Viewer | Data quality report |
| GET | `/api/lineage` | Viewer | Pipeline audit trail |
| POST | `/api/assistant/query` | Viewer | Natural language query |

---

## Appendix B â€” Risk Score Interpretation

| Band | Score Range | Meaning | Recommended Action |
|---|---|---|---|
| LOW | 0 â€“ 24 | Within normal patterns | Routine monitoring |
| MODERATE | 25 â€“ 49 | Minor deviations from norm | Flag for periodic review |
| HIGH | 50 â€“ 74 | Multiple indicators of irregularity | Queue for investigation |
| CRITICAL | 75 â€“ 100 | Strong, multi-dimensional deviation | Prioritise for immediate human review |

> **Disclaimer:** Risk scores are statistical indicators computed against comparable published records. A high score does not constitute evidence of fraud, misconduct, or wrongdoing. Legitimate works can score highly. All scores are for authorised review only.

---

*Document prepared by Team Outlier Ops for internal distribution. Version 1.0 â€” 31 August 2026.*

