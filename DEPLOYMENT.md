# TransparenSee — Deployment Guide

**Stack:** FastAPI (Python) on Railway · Next.js on Vercel  
**Time to deploy:** ~15 minutes

---

## Architecture

```
Browser
  │
  ├──► Vercel (frontend)          https://transparensee.vercel.app
  │       Next.js App Router
  │       calls API via NEXT_PUBLIC_API_URL
  │
  └──► Railway (backend)          https://transparensee.up.railway.app
          FastAPI + SQLite
          ML model (scoring_pack.joblib)
```

---

## Prerequisites

Before deploying, make sure you have run the ML pipeline locally at least once so
the following files exist (they get baked into the Docker image):

```
AiModel/mplads-ai-monitor/
├── data/processed/mplads.db          ← SQLite database (built by pipeline)
└── outputs/models/scoring_pack.joblib ← Trained ML model
```

If they don't exist, run:
```bash
cd AiModel/mplads-ai-monitor
python -m backend.data_pipeline.main --offline --skip-eda --skip-dashboard
```

---

## Step 1 — Push to GitHub

1. Create a new GitHub repository (e.g. `transparensee`)
2. Push your code:
```bash
cd "c:\Users\user\Desktop\New folder\SIH2026\TransparenSee"
git init          # skip if .git already exists
git add .
git commit -m "feat: initial deployment setup"
git remote add origin https://github.com/YOUR_USERNAME/transparensee.git
git push -u origin main
```

> ⚠️ Make sure `data/processed/mplads.db` and `outputs/models/scoring_pack.joblib`
> are NOT in `.gitignore` — they need to be in the repo for Railway to build.

---

## Step 2 — Deploy Backend on Railway

### 2a. Create Railway account
Go to **https://railway.app** → Sign up with GitHub

### 2b. Create new project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose your `transparensee` repository
4. Set the **Root Directory** to: `AiModel/mplads-ai-monitor`

### 2c. Set environment variables
In Railway dashboard → your service → **Variables** tab, add:

| Variable | Value |
|---|---|
| `MPLADS_VIEWER_KEY` | `your-secret-viewer-key` |
| `MPLADS_ANALYST_KEY` | `your-secret-analyst-key` |
| `MPLADS_ADMIN_KEY` | `your-secret-admin-key` |
| `MPLADS_DB_URL` | `sqlite:///data/processed/mplads.db` |

> Replace keys with strong random strings for production.
> Generate one with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### 2d. Generate domain
In Railway → your service → **Settings** → **Networking** → **Generate Domain**

Note down your URL: `https://transparensee-production-xxxx.up.railway.app`

### 2e. Verify backend is running
Visit: `https://your-railway-url.up.railway.app/health`  
Expected response: `{"status": "ok", ...}`

---

## Step 3 — Deploy Frontend on Vercel

### 3a. Create Vercel account
Go to **https://vercel.com** → Sign up with GitHub

### 3b. Import project
1. Click **Add New → Project**
2. Import your `transparensee` GitHub repository
3. Set **Root Directory** to: `frontend`
4. Framework will auto-detect as **Next.js**

### 3c. Set environment variable
In the deployment config screen → **Environment Variables**:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://your-railway-url.up.railway.app` |

> Use your actual Railway URL from Step 2d.

### 3d. Deploy
Click **Deploy** — Vercel will build and deploy in ~2 minutes.

Your app is live at: `https://transparensee.vercel.app`

---

## Step 4 — Verify Full Stack

Open your Vercel URL and check each page:

| Page | URL | Check |
|---|---|---|
| Overview | `/` | KPI cards show real numbers |
| Queue | `/queue` | Works table loads with risk scores |
| Map | `/map` | India map renders with state colors |
| Work Detail | `/work/REC-*` | Individual work details load |

If you see API errors, check that `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly (no trailing slash).

---

## Local Docker Testing (Optional)

Test the full stack locally with Docker before deploying:

```bash
# From the TransparenSee/ root directory
docker compose up --build

# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# API docs: http://localhost:8000/docs
```

Stop everything:
```bash
docker compose down
```

---

## Environment Variables Reference

### Backend (Railway)
| Variable | Required | Description |
|---|---|---|
| `MPLADS_VIEWER_KEY` | Yes | Read-only API key |
| `MPLADS_ANALYST_KEY` | Yes | Analyst API key |
| `MPLADS_ADMIN_KEY` | Yes | Admin API key |
| `MPLADS_DB_URL` | No | SQLite URL (default: `sqlite:///data/processed/mplads.db`) |
| `PORT` | Auto | Set by Railway automatically |

### Frontend (Vercel)
| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Full URL of Railway backend (no trailing slash) |

---

## Troubleshooting

**Map is blank**
- Check browser console for CORS errors
- Verify Railway URL is correct in Vercel env vars
- Make sure `/health` endpoint returns 200 on Railway

**Railway build fails**
- Check that `data/processed/mplads.db` exists in your repo
- Check that `outputs/models/scoring_pack.joblib` exists in your repo
- Look at build logs in Railway dashboard

**Vercel build fails**
- Run `npm run build` locally first to catch errors
- Check that `next.config.ts` has `output: "standalone"`

**API 401 errors**
- The frontend uses the `X-API-Key` header with `dev-viewer-key` by default
- In production, set the actual key in Railway vars and update `frontend/lib/api.ts`

---

## Quick Redeploy

After making changes:
```bash
git add .
git commit -m "fix: your change description"
git push
```
Both Railway and Vercel auto-deploy on every push to `main`. ✅
