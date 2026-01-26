-- Add patientId and doctorId columns to User table
ALTER TABLE "public"."User"
ADD COLUMN "patientId" TEXT;

ALTER TABLE "public"."User"
ADD COLUMN "doctorId" TEXT;

-- Add unique constraints
ALTER TABLE "public"."User" ADD CONSTRAINT "User_patientId_key" UNIQUE ("patientId");

ALTER TABLE "public"."User" ADD CONSTRAINT "User_doctorId_key" UNIQUE ("doctorId");

-- Add foreign key constraints
ALTER TABLE "public"."User" ADD CONSTRAINT "User_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "public"."User" ADD CONSTRAINT "User_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE;