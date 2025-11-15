# Hospital Management System - Backend Structure

## 📁 Project Structure

```
backend/
├── src/
│   ├── ai-analysis/              # AI Symptom Analysis Module
│   │   ├── dto/
│   │   │   ├── analyze-symptoms.dto.ts
│   │   │   ├── create-analysis.dto.ts
│   │   │   └── update-analysis.dto.ts
│   │   ├── rules/
│   │   │   └── basic-rules.ts    # Disease rules and symptom mappings
│   │   ├── ai-analysis.controller.ts
│   │   ├── ai-analysis.module.ts
│   │   ├── ai-analysis.service.ts
│   │   └── ai-analysis.service.spec.ts
│   │
│   ├── admin/                    # Admin Management Module
│   │   ├── dto/
│   │   │   ├── admin-dashboard.dto.ts
│   │   │   ├── manage-role.dto.ts
│   │   │   └── update-user-role.dto.ts
│   │   ├── admin.controller.ts
│   │   ├── admin.module.ts
│   │   ├── admin.service.ts
│   │   └── admin.service.spec.ts
│   │
│   ├── appointments/             # Appointment Management Module
│   │   ├── dtos/
│   │   │   ├── create-appointment.dto.ts
│   │   │   └── update-appointment.dto.ts
│   │   ├── appointments.controller.ts
│   │   ├── appointments.module.ts
│   │   ├── appointments.service.ts
│   │   └── appointments.service.spec.ts
│   │
│   ├── auth/                     # Authentication & Authorization
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts
│   │   │   └── user.decorator.ts
│   │   ├── dtos/
│   │   │   └── auth-credentials.dto.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── cookie.utils.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts
│   │   └── local.strategy.ts
│   │
│   ├── blogs/                    # Blog Posts Module
│   │   ├── dtos/
│   │   │   ├── create-blog.dto.ts
│   │   │   └── update-blog.dto.ts
│   │   ├── blogs.controller.ts
│   │   ├── blogs.module.ts
│   │   ├── blogs.service.ts
│   │   └── blogs.service.spec.ts
│   │
│   ├── cloudinary/               # Cloudinary Service (Media Uploads)
│   │   ├── cloudinary.service.ts
│   │   └── cloudinary.service.spec.ts
│   │
│   ├── comments/                 # Blog Comments Module
│   │   ├── dtos/
│   │   │   ├── create-comment.dto.ts
│   │   │   └── update-comment.dto.ts
│   │   ├── comments.controller.ts
│   │   ├── comments.module.ts
│   │   ├── comments.service.ts
│   │   └── comments.service.spec.ts
│   │
│   ├── common/                   # Shared Utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── guards/
│   │   └── interceptors/
│   │
│   ├── config/                   # Configuration Files
│   │   └── cloudinary.config.ts
│   │
│   ├── doctors/                  # Doctor Management Module
│   │   ├── dtos/
│   │   │   ├── create-doctor.dto.ts
│   │   │   └── update-doctor.dto.ts
│   │   ├── doctors.controller.ts
│   │   ├── doctors.module.ts
│   │   ├── doctors.service.ts
│   │   └── doctors.service.spec.ts
│   │
│   ├── media/                    # Media Management Module
│   │   ├── dtos/
│   │   │   └── upload-media.dto.ts
│   │   ├── media.controller.ts
│   │   ├── media.module.ts
│   │   ├── media.service.ts
│   │   └── media.service.spec.ts
│   │
│   ├── notifications/            # Notification System
│   │   ├── dtos/
│   │   │   └── create-notification.dto.ts
│   │   ├── notifications.controller.ts
│   │   ├── notifications.module.ts
│   │   ├── notifications.service.ts
│   │   ├── notifications.service.spec.ts
│   │   └── scheduler.service.ts
│   │
│   ├── patients/                 # Patient Management Module
│   │   ├── dtos/
│   │   │   ├── create-patient.dto.ts
│   │   │   └── update-patient.dto.ts
│   │   ├── patients.controller.ts
│   │   ├── patients.module.ts
│   │   ├── patients.service.ts
│   │   └── patients.service.spec.ts
│   │
│   ├── prescriptions/            # Prescription Management
│   │   ├── dtos/
│   │   │   ├── create-prescription.dto.ts
│   │   │   └── update-prescription.dto.ts
│   │   ├── prescriptions.controller.ts
│   │   ├── prescriptions.module.ts
│   │   ├── prescriptions.service.ts
│   │   └── prescriptions.service.spec.ts
│   │
│   ├── prisma/                   # Prisma ORM Module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   │
│   ├── symptoms/                 # Symptom Submission Module
│   │   ├── dto/
│   │   │   ├── create-symptom.dto.ts
│   │   │   └── update-symptom.dto.ts
│   │   ├── symptoms.controller.ts
│   │   ├── symptoms.module.ts
│   │   ├── symptoms.service.ts
│   │   └── symptoms.service.spec.ts
│   │
│   ├── users/                    # User Management Module
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   ├── users.controller.ts
│   │   ├── users.module.ts
│   │   ├── users.service.ts
│   │   └── users.service.spec.ts
│   │
│   ├── app.controller.ts         # Root Controller
│   ├── app.module.ts             # Root Module
│   ├── app.service.ts            # Root Service
│   └── main.ts                   # Application Entry Point
│
├── prisma/
│   ├── migrations/               # Database Migrations
│   │   └── [migration-files]
│   ├── dev.db                    # SQLite Dev Database (if used)
│   ├── schema.prisma             # Prisma Schema Definition
│   └── migration_lock.toml
│
├── dist/                         # Compiled JavaScript (generated)
├── node_modules/                 # Dependencies (generated)
├── .env.example                  # Environment Variables Template
├── .eslintrc.js                  # ESLint Configuration
├── nest-cli.json                 # NestJS CLI Configuration
├── package.json                  # Project Dependencies
├── package-lock.json             # Locked Dependencies
├── tsconfig.json                 # TypeScript Configuration
├── tsconfig.build.json           # TypeScript Build Configuration
└── README.md                     # Backend Documentation
```

## 🔑 Key Modules Overview

### 1. **Authentication & Authorization (`auth/`)**

-    JWT-based authentication
-    Role-based access control (PATIENT, DOCTOR, ADMIN)
-    Guards and decorators for route protection

### 2. **AI Analysis (`ai-analysis/`)**

-    Symptom analysis and disease prediction
-    Dynamic follow-up questions
-    Doctor forwarding based on predictions
-    Comprehensive disease rules database

### 3. **Symptoms (`symptoms/`)**

-    Patient symptom submission
-    Integration with AI analysis
-    Symptom history tracking

### 4. **Appointments (`appointments/`)**

-    Appointment booking and management
-    Intelligent doctor routing based on AI predictions
-    Availability checking and time slot management
-    Automatic notifications

### 5. **Patients (`patients/`)**

-    Patient profile management
-    Medical history tracking
-    Patient data CRUD operations

### 6. **Doctors (`doctors/`)**

-    Doctor profile management
-    Specialization and availability tracking
-    Doctor data CRUD operations

### 7. **Prescriptions (`prescriptions/`)**

-    Prescription creation and management
-    Medication tracking
-    Link to appointments and analyses

### 8. **Blogs (`blogs/`)**

-    Medical blog posts by doctors
-    Content management
-    Publishing workflow

### 9. **Comments (`comments/`)**

-    Patient comments on blog posts
-    Moderation support
-    Engagement tracking

### 10. **Media (`media/`)**

-    File uploads via Cloudinary
-    Profile pictures, blog images, medical reports
-    Media management

### 11. **Notifications (`notifications/`)**

-    In-app and email notifications
-    Appointment reminders
-    Status updates
-    Scheduled notifications

### 12. **Admin (`admin/`)**

-    Admin dashboard
-    User management
-    Role management
-    System monitoring

## 📊 Database Schema (Prisma)

### Key Models:

-    **User**: Authentication and user accounts
-    **Patient**: Patient profiles and medical data
-    **Doctor**: Doctor profiles and specializations
-    **Symptom**: Patient symptom entries
-    **Prediction**: AI predictions linked to symptoms
-    **Analysis**: AI analysis results with predictions
-    **Appointment**: Doctor-patient appointments
-    **Prescription**: Medication prescriptions
-    **BlogPost**: Medical blog posts
-    **Comment**: Comments on blog posts
-    **Media**: Uploaded media files
-    **Notification**: System notifications

## 🔐 Environment Variables

See `.env.example` for required environment variables:

-    `DATABASE_URL`: PostgreSQL connection string
-    `JWT_SECRET`: JWT signing secret
-    `CLOUDINARY_*`: Cloudinary configuration
-    `MAIL_*`: Email service configuration
-    `PORT`: Server port (default: 3000)
-    `FRONTEND_URL`: Frontend URL for CORS

## 🚀 API Endpoints

All endpoints are prefixed with `/api`:

### Authentication

-    `POST /api/auth/login` - User login
-    `POST /api/auth/register` - User registration
-    `POST /api/auth/logout` - User logout
-    `POST /api/auth/refresh` - Refresh token

### Symptoms

-    `POST /api/symptoms` - Submit symptoms
-    `GET /api/symptoms/my-symptoms` - Get patient's symptoms
-    `GET /api/symptoms/forwarded` - Get forwarded symptoms (Doctor)
-    `GET /api/symptoms/:id` - Get symptom by ID
-    `PATCH /api/symptoms/:id` - Update symptom
-    `DELETE /api/symptoms/:id` - Delete symptom

### AI Analysis

-    `POST /api/ai-analysis` - Create AI analysis
-    `GET /api/ai-analysis/my-analyses` - Get patient's analyses
-    `GET /api/ai-analysis/my-forwarded` - Get forwarded cases (Doctor)
-    `GET /api/ai-analysis/:id` - Get analysis by ID
-    `POST /api/ai-analysis/:id/confirm` - Confirm diagnosis (Doctor)
-    `POST /api/ai-analysis/:id/review` - Review analysis (Doctor)

### Appointments

-    `POST /api/appointments?analysisId=xxx` - Create appointment (with intelligent routing)
-    `GET /api/appointments/my-appointments` - Get patient's appointments
-    `GET /api/appointments/my-doctor-appointments` - Get doctor's appointments
-    `GET /api/appointments/suggested-doctors/:analysisId` - Get suggested doctors
-    `GET /api/appointments/available-slots/:doctorId?date=YYYY-MM-DD` - Get available slots
-    `PATCH /api/appointments/:id` - Update appointment
-    `DELETE /api/appointments/:id` - Cancel appointment

### Patients

-    `POST /api/patients` - Create patient profile
-    `GET /api/patients/:id` - Get patient by ID
-    `PATCH /api/patients/:id` - Update patient
-    `DELETE /api/patients/:id` - Delete patient

### Doctors

-    `POST /api/doctors` - Create doctor profile
-    `GET /api/doctors` - Get all doctors
-    `GET /api/doctors/:id` - Get doctor by ID
-    `PATCH /api/doctors/:id` - Update doctor
-    `DELETE /api/doctors/:id` - Delete doctor

### Prescriptions

-    `POST /api/prescriptions` - Create prescription
-    `GET /api/prescriptions/my-prescriptions` - Get patient's prescriptions
-    `GET /api/prescriptions/:id` - Get prescription by ID
-    `PATCH /api/prescriptions/:id` - Update prescription

### Blogs

-    `POST /api/blogs` - Create blog post (Doctor)
-    `GET /api/blogs` - Get all published blogs
-    `GET /api/blogs/:id` - Get blog by ID
-    `PATCH /api/blogs/:id` - Update blog
-    `DELETE /api/blogs/:id` - Delete blog

### Notifications

-    `GET /api/notifications/my-notifications` - Get user's notifications
-    `PATCH /api/notifications/:id/read` - Mark as read
-    `DELETE /api/notifications/:id` - Delete notification

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run start:dev

# Build for production
npm run build

# Start production server
npm run start:prod

# Run tests
npm test

# Run e2e tests
npm run test:e2e

# Lint code
npm run lint
```

## 🔄 AI Analysis Flow

1. **Patient submits symptoms** → `POST /api/symptoms`
2. **AI analyzes symptoms** → Creates analysis with predictions
3. **System determines follow-up questions** → Returns questions if needed
4. **Doctor forwarding** → Auto-forwards to appropriate doctor if probability/severity is high
5. **Doctor reviews** → Doctor confirms/rejects diagnosis
6. **Appointment scheduling** → Patient can book appointment with suggested doctor

## 📝 Notes

-    All routes are protected with JWT authentication
-    Role-based access control enforced via guards
-    DTOs validate all incoming data
-    Prisma ORM handles database operations
-    Cloudinary manages media uploads
-    Notifications sent for important events

## 🔗 Integration Points

-    **Frontend**: Angular application at `FRONTEND_URL`
-    **Database**: PostgreSQL via Prisma
-    **Media Storage**: Cloudinary
-    **Email**: SMTP service for notifications
-    **AI Service**: Rule-based analysis (can be extended with external ML API)
