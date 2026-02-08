/*
  Warnings:

  - The values [ROUTINE_REMINDER,CHALLENGE_INVITE] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - The values [STREAK_BONUS,CHALLENGE] on the enum `PointType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `mood` on the `health_tracking` table. All the data in the column will be lost.
  - You are about to drop the column `date_of_birth` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `level_progression` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('SYSTEM', 'MISSION_COMPLETED', 'LEVEL_UP');
ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PointType_new" AS ENUM ('MISSION', 'OTHER');
ALTER TABLE "point_history" ALTER COLUMN "point_type" TYPE "PointType_new" USING ("point_type"::text::"PointType_new");
ALTER TYPE "PointType" RENAME TO "PointType_old";
ALTER TYPE "PointType_new" RENAME TO "PointType";
DROP TYPE "public"."PointType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "level_progression" DROP CONSTRAINT "level_progression_user_id_fkey";

-- AlterTable
ALTER TABLE "health_tracking" DROP COLUMN "mood";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "date_of_birth",
DROP COLUMN "gender";

-- DropTable
DROP TABLE "level_progression";

-- DropEnum
DROP TYPE "Gender";

-- DropEnum
DROP TYPE "Mood";
