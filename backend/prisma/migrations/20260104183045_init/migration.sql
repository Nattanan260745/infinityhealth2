-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female', 'other');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('DAILY', 'CHALLENGE');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('Happy', 'Sad', 'Neutral', 'Excited', 'Tired');

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "gender" "Gender" NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'user',
    "profile_img" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_stats" (
    "stat_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_exp" INTEGER NOT NULL DEFAULT 0,
    "total_points" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "last_activity_date" DATE,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("stat_id")
);

-- CreateTable
CREATE TABLE "levels" (
    "level_id" SERIAL NOT NULL,
    "level_number" INTEGER NOT NULL,
    "level_name" TEXT NOT NULL,
    "hex_code" TEXT,
    "min_exp" INTEGER NOT NULL,
    "max_exp" INTEGER NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("level_id")
);

-- CreateTable
CREATE TABLE "missions" (
    "mission_id" SERIAL NOT NULL,
    "mission_name" TEXT NOT NULL,
    "mission_type" "MissionType" NOT NULL,
    "required_level" INTEGER NOT NULL,
    "reward_exp" INTEGER NOT NULL,
    "reward_points" INTEGER NOT NULL,
    "target_value" INTEGER NOT NULL,
    "target_unit" TEXT NOT NULL,
    "duration_days" INTEGER,

    CONSTRAINT "missions_pkey" PRIMARY KEY ("mission_id")
);

-- CreateTable
CREATE TABLE "user_missions" (
    "user_mission_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "mission_id" INTEGER NOT NULL,
    "current_progress" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "is_claimed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "user_missions_pkey" PRIMARY KEY ("user_mission_id")
);

-- CreateTable
CREATE TABLE "health_tracking" (
    "tracking_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tracking_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "water" INTEGER,
    "sleep_hours" DOUBLE PRECISION,
    "steps_count" INTEGER,
    "mood" "Mood",

    CONSTRAINT "health_tracking_pkey" PRIMARY KEY ("tracking_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_stats_user_id_key" ON "user_stats"("user_id");

-- AddForeignKey
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_missions" ADD CONSTRAINT "user_missions_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "missions"("mission_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_tracking" ADD CONSTRAINT "health_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
