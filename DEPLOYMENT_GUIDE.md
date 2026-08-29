# 🚀 Free Deployment Guide: Vercel (Frontend) + Render (Backend)

This project is fully configured to run **100% freely** with:
- **Frontend**: Hosted on **Vercel** (Global CDN, fast builds, automatic SSL)
- **Backend**: Hosted on **Render** (FastAPI + SQLite, automatic seed & health checks)

---

## 📋 Prerequisites
- A free [GitHub](https://github.com) account (with your code pushed to a repository).
- A free [Render](https://render.com) account.
- A free [Vercel](https://vercel.com) account.

---

## 🛠️ Step 1: Deploy Backend to Render (Takes ~2 minutes)

1. Log into your **[Render Dashboard](https://dashboard.render.com)**.
2. Click **New +** in the top right and select **Web Service**.
3. Connect your GitHub repository (`AmdavadSafai` / `designinf`).
4. Fill in the following details:
   - **Name**: `amdavad-safai-backend` *(or any name you choose)*
   - **Region**: Choose the closest region (e.g. *Singapore* or *Oregon*)
   - **Branch**: `main`
   - **Root Directory**: *(Leave blank)*
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Select **Free**
5. Click **Create Web Service**.
6. Render will build and deploy your backend. When done, you will see a green **"Live"** badge and a backend URL like:
   `https://amdavad-safai-backend.onrender.com`

> **Note**: Test your backend by visiting `https://your-backend.onrender.com/` in your browser. You should see `{"status":"healthy","service":"AmdavadSafai Backend API"}`.

---

## 🌐 Step 2: Deploy Frontend to Vercel (Takes ~1 minute)

1. Open your project's [`vercel.json`](file:///c:/Users/MSI-1/Desktop/designinf/vercel.json) file.
2. Replace `amdavad-safai-backend.onrender.com` with your **actual Render backend URL** from Step 1.
3. Commit and push your changes to GitHub:
   ```bash
   git add vercel.json
   git commit -m "Configure production backend URL"
   git push origin main
   ```
4. Log into your **[Vercel Dashboard](https://vercel.com/dashboard)**.
5. Click **Add New...** -> **Project**.
6. Import your GitHub repository.
7. Vercel will automatically detect **Vite**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
8. Click **Deploy**.

---

## ✅ Step 3: Verification Checklist

| Test | Expected Result | Status |
| :--- | :--- | :--- |
| **Backend Health** | Open `https://your-backend.onrender.com/api/health` | Returns `{"status":"ok"}` |
| **Swagger Docs** | Open `https://your-backend.onrender.com/docs` | Interactive API documentation |
| **Frontend Map** | Open `https://your-app.vercel.app` | Map loads, pins appear from database |
| **New Report Test** | Click "Report Garbage" & submit | Report saves and appears on live map |

---

## 💡 Pro-Tips

### Render Free Tier Spin-Down:
Render free web services enter sleep mode if there are no requests for 15 minutes. 
The first request after sleep will take ~30–40 seconds to wake up the server. Subsequent requests will be instantaneous.

### Optional: Keep Backend Awake with Free Cron Job
You can use a free monitoring service like **[UptimeRobot](https://uptimerobot.com)** (Free) or **[Cron-Job.org](https://cron-job.org)** to ping your backend's `/api/health` URL every 10 minutes so it never goes to sleep!
