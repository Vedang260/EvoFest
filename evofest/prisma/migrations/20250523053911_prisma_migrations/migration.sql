/*
  Warnings:

  - The primary key for the `DailyTicketTypeEntry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `dailyticketTypeEntryId` on the `DailyTicketTypeEntry` table. All the data in the column will be lost.
  - The required column `dailyTicketTypeEntryId` was added to the `DailyTicketTypeEntry` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "DailyTicketTypeEntry" DROP CONSTRAINT "DailyTicketTypeEntry_pkey",
DROP COLUMN "dailyticketTypeEntryId",
ADD COLUMN     "dailyTicketTypeEntryId" TEXT NOT NULL,
ADD CONSTRAINT "DailyTicketTypeEntry_pkey" PRIMARY KEY ("dailyTicketTypeEntryId");
