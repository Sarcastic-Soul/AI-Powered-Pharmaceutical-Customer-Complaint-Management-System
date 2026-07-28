# 🧪 AIVOA - AI-Powered Pharmaceutical Customer Complaint Management System

An enterprise-grade Quality Management System (QMS) Customer Complaint Module designed for pharmaceutical manufacturers producing **API (Active Pharmaceutical Ingredients)** and **FDF (Finished Dosage Forms)**.

Built with **React**, **Redux Toolkit**, **FastAPI**, **LangGraph**, **Groq LLMs** (`llama-3.3-70b-versatile`), and **Neon PostgreSQL**.

---

## 🌟 Core System Capabilities

### 1. Document & Log Auto-Extraction
- **Llama 3.3 (`llama-3.3-70b-versatile`) Extraction Agent**: Ingests unstructured customer emails, Certificates of Analysis (COAs), lab logs, or PDF complaint letters and extracts exact structured QMS fields directly into the registration form.
- Direct support for PDF, plain text, and `.log` file parsing via `python-multipart` and `pypdf`.

### 2. Natural Language Form Editing Assistant (Side-Drawer Chat)
- QA Officers can interact with the system using natural language commands (e.g., *"Set severity level to Critical and update batch number to B-2026-9901"*).
- Powered by **Llama-3.3-70b-versatile** via **LangGraph**, the agent dynamically modifies form fields in real-time.

### 3. Complaint Completeness Checker
- Evaluates real-time field completeness (0–100%) against GAMP/GMP mandatory regulatory requirements.
- Highlights missing mandatory fields (Product Name, Batch Number, Storage Conditions, Manufacturing Date, Sample Status) with weighted impact scores.

### 4. AI Risk Classification & Regulatory Alerting (ICH Q9)
- Categorizes defect risk severity into **Critical**, **Major**, or **Minor** based on GAMP and ICH Q9 risk guidelines.
- Automatically flags mandatory **FDA 15-Day Field Alert Reports (FAR)** or **EMA Annex 16** warnings for critical OOS impurities or contamination.
- Generates executive summaries for QA Director sign-off.

### 5. Root Cause Recommendation Engine (RCA 5-Whys & 6M Fishbone)
- Automated **5 Whys Analysis** step-by-step root cause derivation.
- **6M Ishikawa Fishbone Diagram** (Man, Machine, Material, Method, Measurement, Milieu) breakdown tailored for API chemical synthesis and FDF high-speed packaging lines.

### 6. CAPA Recommendation Engine (ICH Q10)
- Generates actionable **Corrective Actions** (immediate lot quarantine, retain re-test) and **Preventive Actions** (equipment recalibration, SOP update, vision system tuning).
- Assigns priority, ownership roles, and target closure timelines.

### 7. Duplicate Complaint & Recurring Batch Detector
- Scans historical DB complaints using **TF-IDF + Cosine Similarity** and exact **Batch Number matching**.
- Alerts QA teams to recurring lot defects or vendor quality failures.

### 8. 21 CFR Part 11 Electronic Audit Trail
- Maintains an immutable, time-stamped log recording every human and AI interaction, field diff, and system action.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite), Redux Toolkit, Lucide Icons, Tailwind CSS, Google Inter Font |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy ORM, Uvicorn |
| **Agentic Framework** | LangGraph StateGraph |
| **LLMs Provider** | Groq API (`llama-3.3-70b-versatile`) |
| **Database** | PostgreSQL (NeonDB) with SQLite local fallback |

---

## ⚡ Quick Start & Setup

### 1. Environment Configuration (`.env`)

Add your credentials to `.env` in the root or `backend/.env`:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
DATABASE_URL=postgresql://neondb_owner:***@ep-cool-db.neon.tech/neondb?sslmode=require
PRIMARY_MODEL=llama-3.3-70b-versatile
COMPLEX_MODEL=llama-3.3-70b-versatile
```

### 2. Local Execution

#### Backend (FastAPI + LangGraph + PostgreSQL):
```bash
cd backend
python3 -m venv ../venv
source ../venv/bin/activate
pip install -r requirements.txt
PYTHONPATH=. ../venv/bin/python3 -m uvicorn app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/api/docs`

#### Frontend (React + Redux + Vite):
```bash
cd frontend
npm install
npm run dev -- --host 0.0.0.0 --port 3000
```
- App URL: `http://localhost:3000`

---

## 🌐 Production Vercel + NeonDB Deployment

1. **Push to GitHub**: Commit code to your GitHub repository.
2. **Import in Vercel**: Connect the repository to Vercel.
3. **Environment Variables**: Set `DATABASE_URL` and `GROQ_API_KEY` in your Vercel Project Settings.
4. Vercel automatically deploys the React frontend and Python FastAPI serverless backend via [`vercel.json`](file:///home/anish-kumar/Desktop/Assignments/AIVOA/vercel.json).
