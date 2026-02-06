/*
  Warnings:

  - You are about to drop the `exercise_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "exercise_logs" DROP CONSTRAINT "exercise_logs_user_id_fkey";

-- DropTable
DROP TABLE "exercise_logs";
