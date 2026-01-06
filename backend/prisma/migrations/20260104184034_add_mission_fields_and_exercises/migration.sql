-- AlterTable
ALTER TABLE "levels" ADD COLUMN     "color" TEXT,
ADD COLUMN     "title_th" TEXT;

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_time" TEXT,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "start_time" TEXT;

-- CreateTable
CREATE TABLE "exercises" (
    "exercise_id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("exercise_id")
);
