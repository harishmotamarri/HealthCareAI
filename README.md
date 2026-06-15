# MediEase
AI-powered healthcare assistant that translates complex medical reports, prescriptions, and symptoms into clear, actionable health insights.
![Dashboard](assets/img/dashboard.png)
## Demo
Live: [https://mediease-sgek.onrender.com/](https://mediease-ai.vercel.app)
## Overview
- **What problem it solves:** Medical jargon in lab reports, prescriptions, and symptoms can be incredibly confusing and stressful. MediEase simplifies this information so users can understand their health better.
- **Who it is for:** Patients, caregivers, and individuals seeking preliminary, AI-guided health context and clean medication tracking.
- **Key idea behind the project:** Leveraging vision-capable and text-based Large Language Models (via Groq API) integrated with a secure Supabase backend to offer private, instant health reports summaries and symptom insights.
## Features
- **AI Medical Report Analyzer:** Upload PDFs or images of medical reports to receive clear, plain-English summaries.
- **Symptom Checker:** Chat via text or voice to get preliminary medical context, guidelines, and home care tips.
- **First Aid Guidance:** Upload injury photos to get step-by-step emergency care instructions.
- **Prescription Meds Extractor:** Scan prescription sheets to extract dosages and schedule tables automatically.
- **Medication Schedule Tracker:** Track timings, dosages, and maintain daily medication schedules in an interactive calendar interface.
- **Healthcare Locator:** Quickly locate nearby hospitals, clinics, and pharmacies.
## Tech Stack
### Frontend
- HTML5
- Vanilla JavaScript
- CSS3 (Custom Glassmorphic styles)
### Backend
- Node.js
- Express.js (v5)
### Database
- Supabase (PostgreSQL + Supabase Auth)
### Tools
- Groq SDK (Llama 3.2 Vision, Llama 3.3 70B)
- Multer (Multipart form/file uploads)
- PDF-parse (Server-side document reading)
- Git
## Screenshots
### Home Page
![Home](assets/img/home.png)
### Dashboard
![Dashboard](assets/img/dashboard.png)
## Architecture
```text
Client (HTML/JS/CSS)
      ↓ (Supabase JWT Bearer Auth)
Backend API (Express.js)
      ↓ (Groq SDK)
Supabase (Postgres) & Llama LLMs (Groq)
Project Structure
text


MediEase/
├── assets/
│   ├── css/
│   │   ├── auth.css
│   │   ├── dashboard.css
│   │   ├── landing.css
│   │   └── shared.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   ├── landing.js
│   │   └── supabase-client.js
│   └── img/
│       ├── favicon.ico
│       └── images.jpg
├── uploads/
├── .env.example
├── .gitignore
├── dashboard.html
├── index.html
├── login.html
├── signup.html
├── package.json
├── server.js
└── supabase.js
Installation
Clone Repository
bash


git clone https://github.com/harishmotamarri/HealthCareAI.git
cd HealthCareAI
Install Dependencies
bash


npm install
Run
bash


npm start
Environment Variables
env


PORT=3000
GROQ_API_KEY=your_groq_api_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
API Documentation
Example Endpoint: Check Symptoms
http


POST /api/check-symptoms
Request Body:

json


{
  "message": "I have a mild fever and a sore throat.",
  "history": []
}
Response:

json


{
  "reply": "Based on your symptoms, you may be experiencing a mild viral infection or pharyngitis. Here are some home care suggestions..."
}
Challenges & Learnings
Multi-modal Handling: Successfully extracting raw text from uploaded PDFs using pdf-parse and passing report images to Groq's llama-3.2-11b-vision-preview model for contextual analysis.
AI Safety & Guardrails: Fine-tuning AI system prompts to deliver helpful health information without making definitive diagnoses or replacing professional medical advice.
Token Authorization Sync: Integrating Supabase client-side sessions with an Express API backend, verifying JWTs, and enforcing PostgreSQL Row Level Security (RLS).
Future Improvements
Medication Reminders: Automated WhatsApp, SMS, or email notification alerts for scheduled medicines.
Offline Mode: Local cache storage using IndexedDB to read saved reports without an internet connection.
Multi-Language Support: Translation of reports and AI summaries into local languages.
Contributing
Contributions are welcome. Feel free to open issues or submit pull requests.

License
MIT License

Author
Harish Motamarri
GitHub: https://github.com/harishmotamarri
LinkedIn: https://linkedin.com/in/harishmotamarri



***
### Summary of updates:
1. Filled out your provided template with **MediEase** specific details (Groq vision stack, Supabase Postgres, and HTML/CSS/JS frontend).
2. Documented the actual directory structure and key Express server API endpoints.
3. Filled in the real Challenges & Learnings (AI guardrails, PDF/Image processing, token verification) and future roadmaps.
4. Linked your GitHub profile as the author.

