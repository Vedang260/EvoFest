/*
  Warnings:

  - You are about to drop the column `eventId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `dailyTicketTypeEntryId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_eventId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "eventId",
ADD COLUMN     "dailyTicketTypeEntryId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_dailyTicketTypeEntryId_fkey" FOREIGN KEY ("dailyTicketTypeEntryId") REFERENCES "DailyTicketTypeEntry"("dailyTicketTypeEntryId") ON DELETE CASCADE ON UPDATE CASCADE;
