# MediEase — AI-Powered Healthcare Dashboard

MediEase is a full-stack healthcare web app that uses AI to analyze medical reports, check symptoms, provide first aid guidance, and manage medications — all in a clean, modern dashboard.

## Features

- **Medical Report Analyzer** — Upload reports (PDF, images) and get AI-powered plain-English summaries
- **Symptom Checker** — Describe symptoms via text or voice and get health insights
- **First Aid Guide** — Take a photo of an injury for instant AI first aid instructions
- **Medication Planner** — Track medicines, set reminders, and view daily schedules
- **Find Healthcare** — Browse nearby hospitals and specialists
- **Light/Dark Mode** — Full theme support across all pages

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS (custom), Vanilla JS |
| Backend | Node.js, Express 5 |
| AI | Groq API (Llama 4 Scout vision, Llama 3.3 70B text) |
| Database | Supabase (PostgreSQL + Auth) |
| File Uploads | Multer |

## Project Structure

```
├── server.js              # Express API server
├── supabase.js            # Supabase client (server-side)
├── package.json
├── .env.example           # Environment variable template
├── .gitignore
│
├── index.html             # Landing page
├── login.html             # Login page
├── signup.html            # Signup page
├── dashboard.html         # Main app dashboard
│
├── assets/
│   ├── css/
│   │   ├── shared.css     # CSS variables & common styles
│   │   ├── landing.css    # Landing page styles
│   │   ├── auth.css       # Login/signup styles
│   │   └── dashboard.css  # Dashboard styles
│   ├── js/
│   │   ├── supabase-client.js  # Supabase client (browser-side)
│   │   ├── landing.js     # Landing page logic
│   │   ├── auth.js        # Auth flow logic
│   │   └── dashboard.js   # Dashboard app logic
│   └── img/               # Static images
│
└── uploads/               # Temporary file uploads (gitignored)
```

## Setup

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Groq](https://console.groq.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/harishmotamarri/HealthCareAI.git
cd HealthCareAI
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Fill in your `.env`:

```
GROQ_API_KEY=gsk_your_key_here
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Supabase Tables

Run this SQL in your Supabase Dashboard → SQL Editor:

```sql
-- Medical reports table
CREATE TABLE IF NOT EXISTS medical_reports (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT,
    stored_name TEXT,
    report_type TEXT DEFAULT 'Medical Report',
    analysis TEXT,
    file_size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Medications table
CREATE TABLE IF NOT EXISTS medications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    dosage TEXT DEFAULT '1 tablet',
    frequency TEXT DEFAULT 'Once daily',
    timing TEXT DEFAULT 'After food',
    duration TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
```

### 4. Run

```bash
npm start
```

Open `http://localhost:3000`

## Deployment (Render / Railway / VPS)

1. Push your code to GitHub (`.env` is gitignored)
2. Set all env vars from `.env.example` in your hosting platform's settings
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Ensure Node.js 18+ runtime

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reports/upload` | Yes | Upload & analyze a medical report |
| GET | `/api/reports` | Yes | List user's reports |
| DELETE | `/api/reports/:id` | Yes | Delete a report |
| POST | `/api/reports/ask` | Yes | Ask AI about your reports |
| POST | `/api/firstaid/analyze` | No | Analyze injury photo |
| POST | `/api/prescriptions/extract` | Yes | Extract meds from prescription |
| POST | `/api/check-symptoms` | No | Symptom checker / health chat |
| GET | `/api/medications` | Yes | List user's medications |
| POST | `/api/medications` | Yes | Add a medication |
| DELETE | `/api/medications/:id` | Yes | Delete a medication |

## License

ISC
