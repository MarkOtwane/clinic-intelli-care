-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('PATIENT', 'DOCTOR', 'ADMIN');

-- CreateTable
CREATE TABLE
    "public"."User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "mustChangePassword" BOOLEAN NOT NULL DEFAULT false,
        "role" "public"."Role" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."RefreshToken" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "tokenHash" TEXT NOT NULL,
        "userAgent" TEXT,
        "ip" TEXT,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Profile" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "phone" TEXT,
        "avatarId" TEXT,
        "bio" TEXT,
        CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Media" (
        "id" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "publicId" TEXT NOT NULL,
        "mimeType" TEXT,
        "size" INTEGER,
        "uploadedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Patient" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "medicalRecord" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Doctor" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "specialty" TEXT NOT NULL,
        "qualification" TEXT,
        "bio" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Symptom" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "location" TEXT,
        "medications" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Prediction" (
        "id" TEXT NOT NULL,
        "symptomId" TEXT NOT NULL,
        "results" JSONB NOT NULL,
        "followUps" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "forwardedToId" TEXT,
        CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Appointment" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "doctorId" TEXT,
        "startTime" TIMESTAMP(3) NOT NULL,
        "endTime" TIMESTAMP(3),
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "reason" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Prescription" (
        "id" TEXT NOT NULL,
        "patientId" TEXT NOT NULL,
        "doctorId" TEXT,
        "medications" JSONB NOT NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Prescription_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."BlogPost" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "likes" INTEGER NOT NULL DEFAULT 0,
        "published" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."Comment" (
        "id" TEXT NOT NULL,
        "postId" TEXT NOT NULL,
        "authorId" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "moderated" BOOLEAN NOT NULL DEFAULT false,
        CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
    );

-- CreateTable
CREATE TABLE
    "public"."_BlogImages" (
        "A" TEXT NOT NULL,
        "B" TEXT NOT NULL,
        CONSTRAINT "_BlogImages_AB_pkey" PRIMARY KEY ("A", "B")
    );

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User" ("email");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_idx" ON "public"."RefreshToken" ("userId");

-- CreateIndex
CREATE INDEX "RefreshToken_expiresAt_idx" ON "public"."RefreshToken" ("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "public"."Profile" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_avatarId_key" ON "public"."Profile" ("avatarId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_userId_key" ON "public"."Patient" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_userId_key" ON "public"."Doctor" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Prediction_symptomId_key" ON "public"."Prediction" ("symptomId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "public"."BlogPost" ("slug");

-- CreateIndex
CREATE INDEX "_BlogImages_B_index" ON "public"."_BlogImages" ("B");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Profile" ADD CONSTRAINT "Profile_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "public"."Media" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Media" ADD CONSTRAINT "Media_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "public"."User" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Doctor" ADD CONSTRAINT "Doctor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Symptom" ADD CONSTRAINT "Symptom_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prediction" ADD CONSTRAINT "Prediction_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "public"."Symptom" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prediction" ADD CONSTRAINT "Prediction_forwardedToId_fkey" FOREIGN KEY ("forwardedToId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Prescription" ADD CONSTRAINT "Prescription_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."Doctor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."BlogPost" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogImages" ADD CONSTRAINT "_BlogImages_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."BlogPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BlogImages" ADD CONSTRAINT "_BlogImages_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Media" ("id") ON DELETE CASCADE ON UPDATE CASCADE;