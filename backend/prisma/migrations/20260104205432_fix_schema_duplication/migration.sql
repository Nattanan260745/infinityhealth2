-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bio" TEXT;

-- CreateTable
CREATE TABLE "daily_goals" (
    "goal_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "goal_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_goals_pkey" PRIMARY KEY ("goal_id")
);

-- CreateTable
CREATE TABLE "routines" (
    "routine_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "scheduled_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "routines_pkey" PRIMARY KEY ("routine_id")
);

-- AddForeignKey
ALTER TABLE "daily_goals" ADD CONSTRAINT "daily_goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
