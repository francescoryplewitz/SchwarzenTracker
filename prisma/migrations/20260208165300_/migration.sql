/*
  Warnings:

  - You are about to drop the column `restAfterSeconds` on the `PlanExercise` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PlanDayType" AS ENUM ('BOTH', 'A', 'B');

-- CreateEnum
CREATE TYPE "WorkoutDayType" AS ENUM ('A', 'B');

-- AlterTable
ALTER TABLE "PlanExercise" DROP COLUMN "restAfterSeconds",
ADD COLUMN     "dayType" "PlanDayType" NOT NULL DEFAULT 'BOTH';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "locale" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "dayType" "WorkoutDayType";

-- CreateTable
CREATE TABLE "ExerciseNote" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseTranslation" (
    "exerciseId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "ExerciseTranslation_pkey" PRIMARY KEY ("exerciseId","locale")
);

-- CreateTable
CREATE TABLE "ExerciseVariantTranslation" (
    "exerciseVariantId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "ExerciseVariantTranslation_pkey" PRIMARY KEY ("exerciseVariantId","locale")
);

-- CreateTable
CREATE TABLE "TrainingPlanTranslation" (
    "trainingPlanId" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "TrainingPlanTranslation_pkey" PRIMARY KEY ("trainingPlanId","locale")
);

-- CreateTable
CREATE TABLE "PlanExerciseProgressSet" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "planExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "reps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanExerciseProgressSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanExerciseSet" (
    "id" TEXT NOT NULL,
    "planExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "targetMinReps" INTEGER NOT NULL,
    "targetMaxReps" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlanExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseNote_userId_exerciseId_key" ON "ExerciseNote"("userId", "exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "PlanExerciseProgressSet_userId_planExerciseId_setNumber_key" ON "PlanExerciseProgressSet"("userId", "planExerciseId", "setNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PlanExerciseSet_planExerciseId_setNumber_key" ON "PlanExerciseSet"("planExerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "ExerciseNote" ADD CONSTRAINT "ExerciseNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseNote" ADD CONSTRAINT "ExerciseNote_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseTranslation" ADD CONSTRAINT "ExerciseTranslation_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseVariantTranslation" ADD CONSTRAINT "ExerciseVariantTranslation_exerciseVariantId_fkey" FOREIGN KEY ("exerciseVariantId") REFERENCES "ExerciseVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanTranslation" ADD CONSTRAINT "TrainingPlanTranslation_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExerciseProgressSet" ADD CONSTRAINT "PlanExerciseProgressSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExerciseProgressSet" ADD CONSTRAINT "PlanExerciseProgressSet_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "PlanExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlanExerciseSet" ADD CONSTRAINT "PlanExerciseSet_planExerciseId_fkey" FOREIGN KEY ("planExerciseId") REFERENCES "PlanExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
