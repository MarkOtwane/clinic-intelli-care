-- Add missing columns to Patient table
ALTER TABLE "public"."Patient"
ADD COLUMN "name" TEXT;

ALTER TABLE "public"."Patient"
ADD COLUMN "age" INTEGER;

ALTER TABLE "public"."Patient"
ADD COLUMN "gender" TEXT;

ALTER TABLE "public"."Patient"
ADD COLUMN "address" TEXT;

ALTER TABLE "public"."Patient"
ADD COLUMN "phone" TEXT;

ALTER TABLE "public"."Patient"
ADD COLUMN "medicalData" JSONB;

ALTER TABLE "public"."Patient"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create Analysis table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."Analysis" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "doctorId" TEXT,
        "symptoms" JSONB NOT NULL,
        "initialAnalysis" JSONB,
        "predictedDiseases" JSONB NOT NULL,
        "recommendations" TEXT,
        "followUpQuestions" JSONB,
        "followUpAnswers" JSONB,
        "conversationHistory" JSONB,
        "analysisStatus" TEXT NOT NULL DEFAULT 'INITIAL',
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Analysis_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Analysis_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

-- Create Symptom table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."Symptom" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "location" TEXT,
        "medications" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Symptom_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- Create Prediction table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."Prediction" (
        "id" TEXT NOT NULL,
        "symptomId" TEXT NOT NULL,
        "results" JSONB NOT NULL,
        "followUps" JSONB,
        "forwardedToId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Prediction_symptomId_key" UNIQUE ("symptomId"),
        CONSTRAINT "Prediction_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "public"."Symptom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Prediction_forwardedToId_fkey" FOREIGN KEY ("forwardedToId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

-- Create Appointment table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."Appointment" (
        "id" TEXT NOT NULL,
        "date" TIMESTAMP(3) NOT NULL,
        "time" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "notes" TEXT,
        "patientId" TEXT NOT NULL,
        "doctorId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- Create Prescription table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."Prescription" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "doctorId" TEXT NOT NULL,
        "appointmentId" TEXT,
        "analysisId" TEXT,
        "medications" JSONB NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "Prescription_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "public"."Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "Prescription_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "public"."Analysis" ("id") ON DELETE SET NULL ON UPDATE CASCADE
    );

-- Create DoctorAvailability table if it doesn't exist
CREATE TABLE
    IF NOT EXISTS "public"."DoctorAvailability" (
        "id" TEXT NOT NULL,
        "doctorId" TEXT NOT NULL,
        "dayOfWeek" INTEGER NOT NULL,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        "isAvailable" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "DoctorAvailability_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "DoctorAvailability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        CONSTRAINT "DoctorAvailability_doctorId_dayOfWeek_key" UNIQUE ("doctorId", "dayOfWeek")
    );

-- Create indices
CREATE INDEX IF NOT EXISTS "Symptom_patientId_idx" ON "public"."Symptom" ("patientId");

CREATE INDEX IF NOT EXISTS "DoctorAvailability_dayOfWeek_idx" ON "public"."DoctorAvailability" ("dayOfWeek");

CREATE INDEX IF NOT EXISTS "Analysis_patientId_idx" ON "public"."Analysis" ("patientId");

CREATE INDEX IF NOT EXISTS "Appointment_patientId_idx" ON "public"."Appointment" ("patientId");

CREATE INDEX IF NOT EXISTS "Appointment_doctorId_idx" ON "public"."Appointment" ("doctorId");

CREATE INDEX IF NOT EXISTS "Prescription_patientId_idx" ON "public"."Prescription" ("patientId");

CREATE INDEX IF NOT EXISTS "Prescription_doctorId_idx" ON "public"."Prescription" ("doctorId");