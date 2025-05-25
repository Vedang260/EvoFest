/*
  Warnings:

  - You are about to drop the column `qrCode` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "qrCode";

-- AlterTable
ALTER TABLE "Guest" ADD COLUMN     "qrCode" TEXT;
