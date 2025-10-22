-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'THERAPIST', 'RESPONSIBLE', 'NUTRITIONIST');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'NOT_INFORMED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('CONSULTATION', 'THERAPY', 'EVALUATION', 'FOLLOW_UP', 'NUTRITION_CONSULTATION', 'NUTRITIONAL_ASSESSMENT');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('ANAMNESE', 'MEDICAL_REPORT', 'PRESCRIPTION', 'NUTRITION_PLAN', 'PROGRESS_REPORT', 'EXAM_RESULT', 'PHOTO', 'OTHER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'THERAPIST',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLogin" TIMESTAMP(3),
    "professionalId" TEXT,
    "specialties" TEXT[],
    "bio" TEXT,
    "experienceYears" INTEGER DEFAULT 0,
    "languages" TEXT[] DEFAULT ARRAY['Português']::TEXT[],
    "consultationDuration" INTEGER DEFAULT 50,
    "maxDailyAppointments" INTEGER DEFAULT 8,
    "workingDays" TEXT[] DEFAULT ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI']::TEXT[],
    "workingHours" JSONB,
    "createdBy" TEXT,
    "lastModifiedBy" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "birthDate" TIMESTAMP(3),
    "gender" "Gender" NOT NULL DEFAULT 'NOT_INFORMED',
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipCode" TEXT,
    "emergencyContact" TEXT,
    "emergencyContactPhone" TEXT,
    "medicalHistory" TEXT,
    "currentMedications" TEXT,
    "allergies" TEXT,
    "observations" TEXT,
    "responsibleName" TEXT,
    "responsiblePhone" TEXT,
    "responsibleEmail" TEXT,
    "responsibleRelation" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 50,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'SCHEDULED',
    "title" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "recurringPattern" TEXT,
    "recurringUntil" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancelledBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "objectives" TEXT,
    "activities" TEXT,
    "observations" TEXT,
    "evolution" TEXT,
    "homework" TEXT,
    "nextSteps" TEXT,
    "patientMood" TEXT,
    "sessionQuality" INTEGER,
    "professionalNotes" TEXT,
    "currentWeight" DOUBLE PRECISION,
    "currentHeight" DOUBLE PRECISION,
    "bloodPressure" TEXT,
    "heartRate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "sessionId" TEXT,
    "uploadedBy" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "parentId" TEXT,
    "isLatest" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "allowedRoles" "UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anamneses" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "mainComplaint" TEXT,
    "currentHistory" TEXT,
    "pastHistory" TEXT,
    "familyHistory" TEXT,
    "socialHistory" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "goals" TEXT[],
    "targetWeight" DOUBLE PRECISION,
    "targetCalories" INTEGER,
    "targetProtein" DOUBLE PRECISION,
    "targetCarbs" DOUBLE PRECISION,
    "targetFat" DOUBLE PRECISION,
    "mealPlan" JSONB NOT NULL,
    "restrictions" TEXT[],
    "allergies" TEXT[],
    "preferences" TEXT[],
    "instructions" TEXT,
    "observations" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_assessments" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "nutritionistId" TEXT NOT NULL,
    "assessmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "waistCirc" DOUBLE PRECISION,
    "hipCirc" DOUBLE PRECISION,
    "bodyFat" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "bmr" DOUBLE PRECISION,
    "tdee" DOUBLE PRECISION,
    "currentDiet" TEXT,
    "eatingHabits" TEXT,
    "supplementation" TEXT,
    "hydration" TEXT,
    "bloodTests" JSONB,
    "vitalSigns" JSONB,
    "clinicalSigns" TEXT,
    "goals" TEXT[],
    "recommendations" TEXT,
    "nextAssessment" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_professionalId_key" ON "users"("professionalId");

-- CreateIndex
CREATE INDEX "users_role_status_idx" ON "users"("role", "status");

-- CreateIndex
CREATE UNIQUE INDEX "patients_cpf_key" ON "patients"("cpf");

-- CreateIndex
CREATE INDEX "patients_isActive_createdAt_idx" ON "patients"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX "appointments_professionalId_dateTime_idx" ON "appointments"("professionalId", "dateTime");

-- CreateIndex
CREATE INDEX "appointments_patientId_status_idx" ON "appointments"("patientId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_appointmentId_key" ON "sessions"("appointmentId");

-- CreateIndex
CREATE INDEX "sessions_professionalId_startTime_idx" ON "sessions"("professionalId", "startTime");

-- CreateIndex
CREATE INDEX "documents_patientId_type_idx" ON "documents"("patientId", "type");

-- CreateIndex
CREATE INDEX "nutrition_plans_patientId_isActive_idx" ON "nutrition_plans"("patientId", "isActive");

-- CreateIndex
CREATE INDEX "nutrition_assessments_patientId_assessmentDate_idx" ON "nutrition_assessments"("patientId", "assessmentDate");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "documents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_nutritionistId_fkey" FOREIGN KEY ("nutritionistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_assessments" ADD CONSTRAINT "nutrition_assessments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nutrition_assessments" ADD CONSTRAINT "nutrition_assessments_nutritionistId_fkey" FOREIGN KEY ("nutritionistId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
