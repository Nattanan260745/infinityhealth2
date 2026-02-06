/*
  Warnings:

  - You are about to drop the `exercises` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'MISSION_COMPLETED', 'LEVEL_UP', 'ROUTINE_REMINDER', 'CHALLENGE_INVITE');

-- CreateEnum
CREATE TYPE "PointType" AS ENUM ('MISSION', 'STREAK_BONUS', 'CHALLENGE', 'OTHER');

-- DropForeignKey
ALTER TABLE "user_missions" DROP CONSTRAINT "user_missions_mission_id_fkey";

-- DropForeignKey
ALTER TABLE "user_missions" DROP CONSTRAINT "user_missions_user_id_fkey";

-- AlterTable
ALTER TABLE "missions" ADD COLUMN     "presets" JSONB;

-- AlterTable
ALTER TABLE "user_missions" ADD COLUMN     "claimed_at" TIMESTAMP(3),
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "end_date" DATE,
ADD COLUMN     "start_date" DATE;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "push_token" TEXT;

-- DropTable
DROP TABLE "exercises";

-- CreateTable
CREATE TABLE "exercise_categories" (
    "category_id" SERIAL NOT NULL,
    "category_name" TEXT NOT NULL,
    "icon_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "exercise_videos" (
    "video_id" SERIAL NOT NULL,
    "category_id" INTEGER NOT NULL,
    "video_title" TEXT NOT NULL,
    "video_url" TEXT,
    "video_thumbnail" TEXT,
    "difficulty_level" TEXT NOT NULL,
    "body_part" TEXT,
    "duration_minutes" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_videos_pkey" PRIMARY KEY ("video_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "reference_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "setting_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_unknown_login" BOOLEAN NOT NULL DEFAULT true,
    "push_mission" BOOLEAN NOT NULL DEFAULT true,
    "push_routine" BOOLEAN NOT NULL DEFAULT true,
    "push_news" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "point_history" (
    "history_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mission_id" INTEGER,
    "points_earned" INTEGER NOT NULL,
    "point_type" "PointType" NOT NULL,
    "earned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_history_pkey" PRIMARY KEY ("history_id")
);

-- CreateTable
CREATE TABLE "exercise_logs" (
    "log_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "exercise_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exercise_type" TEXT NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "distance_km" DOUBLE PRECISION,
    "calories_burned" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercise_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "level_progression" (
    "progression_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "old_level" INTEGER NOT NULL,
    "new_level" INTEGER NOT NULL,
    "points_used" INTEGER,
    "exp_used" INTEGER,
    "leveled_up_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "level_progression_pkey" PRIMARY KEY ("progression_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");

-- AddForeignKey
ALTER TABLE "exercise_videos" ADD CONSTRAINT "exercise_videos_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("category_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point_history" ADD CONSTRAINT "point_history_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_logs" ADD CONSTRAINT "exercise_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "level_progression" ADD CONSTRAINT "level_progression_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
