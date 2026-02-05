# Clinic IntelliCare 🏥🤖

**AI-Assisted Hospital Management & Smart Patient Routing System**

## 📌 Overview

Clinic IntelliCare is a full‑stack hospital/clinic management system that combines traditional HMS workflows with AI‑assisted symptom analysis and smart routing. It is built as an academic project to demonstrate how AI can improve triage, scheduling, and clinical decision support.

## 🚀 Key Features

### Patient Experience

- Secure registration and login.
- Symptom submission with severity and duration.
- AI‑assisted preliminary analysis with probability scores.
- Follow‑up questions when symptoms are ambiguous.
- View appointments and prescriptions.

### Clinical & Admin Workflow

- Doctor dashboard for forwarded cases.
- Confirm or reject AI predictions and issue prescriptions.
- Appointment scheduling and availability management.
- Admin tools for users, roles, and system oversight.

### Additional Modules

- Blog and community content (backend complete; UI in progress).
- Notifications (in‑app and email).
- Media uploads via Cloudinary.

## 🧱 Tech Stack

- **Frontend:** Angular 19 (Angular Material, standalone components)
- **Backend:** NestJS 11
- **Database:** PostgreSQL (via Prisma ORM)
- **AI:** Google Gemini API with optional OpenAI fallback
- **Auth:** JWT + refresh tokens
- **Email:** SMTP (configurable)

## 📁 Repository Structure

```
backend/   # NestJS API, Prisma schema, migrations
frontend/  # Angular application
```

## ⚙️ Setup & Installation

### 1) Backend

```
cd backend
npm install
```

Create a .env file from the template:

```
cp .env.example .env
```

Run Prisma migrations:

```
npx prisma migrate dev
```

Start the API:

```
npm run start:dev
```

### 2) Frontend

```
cd frontend
npm install
npm start
```

Frontend runs at http://localhost:4200 and backend at http://localhost:3000 by default.

## 🔐 Environment Variables

Required backend variables are listed in [backend/.env.example](backend/.env.example).
Key options include:

- `DATABASE_URL`
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET`
- `AI_API_KEY` (Gemini)
- `USE_OPENAI`, `OPENAI_API_KEY` (optional)
- `CLOUDINARY_*`
- `EMAIL_*`

## ✅ Current Status

The system is actively developed. Core patient and prescription workflows are complete, with blog UI and notifications in progress. See [DEVELOPMENT_PROGRESS.md](DEVELOPMENT_PROGRESS.md) for detailed status.

## 🧪 Testing

Backend tests:

```
cd backend
npm run test
```

Frontend tests:

```
cd frontend
npm test
```

## 📚 Documentation

- Backend module map: [BACKEND_STRUCTURE.md](BACKEND_STRUCTURE.md)
- AI analysis fixes and test script: [AI_ANALYSIS_FIXES.md](AI_ANALYSIS_FIXES.md)
- Responsive UI references: [RESPONSIVE_QUICK_REFERENCE.md](RESPONSIVE_QUICK_REFERENCE.md)

## 📝 License

This project is for academic purposes.
