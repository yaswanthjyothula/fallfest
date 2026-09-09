# Local Development & Testing Guide

## 1. Prerequisites

- **Python**: Version 3.10, 3.11, 3.12, or 3.13 (recommended: Python 3.11+)
- **Node.js**: Version 20+ with `npm`
- **Git**: Version 2.30+

---

## 2. Installation Steps

### Step A: Clone & Set Up Backend Environment
```bash
git clone https://github.com/yaswanthjyothula/fallfest.git
cd fallfest

# Create and activate virtual environment (optional but recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt
```

### Step B: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your database URL and API keys are set if you want live weather and Copernicus satellite feeds.

### Step C: Set Up Frontend Environment
```bash
cd frontend
npm install
```

---

## 3. Launching Services Locally

| Service | Port | Command | Purpose |
| :--- | :--- | :--- | :--- |
| **Next.js Web App** | `:3000` | `cd frontend && npm run dev` | Primary user-facing web application |
| **FastAPI REST API** | `:8000` | `python -m uvicorn backend.api:app --reload --port 8000` | Core backend REST API & Swagger docs (`/docs`) |
| **Streamlit Console** | `:8501` | `python -m streamlit run app.py --server.port 8501` | Internal quantum research & simulation terminal |

---

## 4. Running Verification & Automated Tests

### Run Full Test Suite
```bash
python -m unittest discover tests -v
```

### Run System Health Check Script
```bash
python scripts/verify_system.py
```

### Test Frontend Production Build
```bash
cd frontend
npm run build
```
