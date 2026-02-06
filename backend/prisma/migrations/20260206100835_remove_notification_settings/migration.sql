/*
  Warnings:

  - You are about to drop the `notification_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notification_settings" DROP CONSTRAINT "notification_settings_user_id_fkey";

-- DropTable
DROP TABLE "notification_settings";
