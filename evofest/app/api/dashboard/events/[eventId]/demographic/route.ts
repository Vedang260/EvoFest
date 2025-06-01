import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/middleware/authMiddleware';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;

    const user = await authMiddleware(request, ['ADMIN', 'ORGANIZER']);
    if ('status' in user) return user;

    // 1. Age Distribution (e.g., group ages: 0-17, 18-24, 25-34, 35-44, etc.)
    const ageDistribution = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN age < 18 THEN '0-17'
          WHEN age BETWEEN 18 AND 24 THEN '18-24'
          WHEN age BETWEEN 25 AND 34 THEN '25-34'
          WHEN age BETWEEN 35 AND 44 THEN '35-44'
          WHEN age BETWEEN 45 AND 54 THEN '45-54'
          ELSE '55+'
        END AS age_group,
        COUNT(*) AS count
      FROM "Guest"
      WHERE "bookingId" IN (
        SELECT "bookingId" FROM "Booking"
        WHERE "dailyTicketTypeEntryId" IN (
          SELECT "dailyTicketTypeEntryId" FROM "DailyTicketTypeEntry"
          WHERE "eventScheduleId" IN (
            SELECT "eventScheduleId" FROM "EventSchedule" WHERE "eventId" = ${eventId}
          )
        )
      )
      GROUP BY age_group
      ORDER BY age_group;
    `;

    // 2. Gender Breakdown
    const genderBreakdown = await prisma.$queryRaw`
      SELECT gender, COUNT(*) AS count
      FROM "Guest"
      WHERE "bookingId" IN (
        SELECT "bookingId" FROM "Booking"
        WHERE "dailyTicketTypeEntryId" IN (
          SELECT "dailyTicketTypeEntryId" FROM "DailyTicketTypeEntry"
          WHERE "eventScheduleId" IN (
            SELECT "eventScheduleId" FROM "EventSchedule" WHERE "eventId" = ${eventId}
          )
        )
      )
      GROUP BY gender;
    `;

    // 3. Demographics by Ticket Type
    const ticketTypeDemographics = await prisma.$queryRaw`
      SELECT 
        dtt."type" AS ticket_type,
        g.gender,
        COUNT(*) AS count
      FROM "Guest" g
      JOIN "Booking" b ON g."bookingId" = b."bookingId"
      JOIN "DailyTicketTypeEntry" dtt ON b."dailyTicketTypeEntryId" = dtt."dailyTicketTypeEntryId"
      JOIN "EventSchedule" es ON dtt."eventScheduleId" = es."eventScheduleId"
      WHERE es."eventId" = ${eventId}
      GROUP BY ticket_type, g.gender
      ORDER BY ticket_type, g.gender;
    `;

    // 4. Daily Demographics (age group + gender per day)
    const dailyDemographics = await prisma.$queryRaw`
      SELECT 
        TO_CHAR(ci."checkInAt", 'YYYY-MM-DD') AS day,
        CASE 
          WHEN g.age < 18 THEN '0-17'
          WHEN g.age BETWEEN 18 AND 24 THEN '18-24'
          WHEN g.age BETWEEN 25 AND 34 THEN '25-34'
          WHEN g.age BETWEEN 35 AND 44 THEN '35-44'
          WHEN g.age BETWEEN 45 AND 54 THEN '45-54'
          ELSE '55+'
        END AS age_group,
        g.gender,
        COUNT(*) AS count
      FROM "CheckIn" ci
      JOIN "Guest" g ON ci."guestId" = g."guestId"
      WHERE ci."eventId" = ${eventId}
      GROUP BY day, age_group, g.gender
      ORDER BY day, age_group, g.gender;
    `;

    // Helper to handle BigInt values
    function replaceBigInt(obj: any): any {
      if (Array.isArray(obj)) {
        return obj.map(replaceBigInt);
      } else if (obj && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([k, v]) => [k, replaceBigInt(v)])
        );
      } else if (typeof obj === 'bigint') {
        return Number(obj); // Safe conversion
      }
      return obj;
    }

    return NextResponse.json(
      replaceBigInt({
        ageDistribution,
        genderBreakdown,
        ticketTypeDemographics,
        dailyDemographics,
      })
    );
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch demographic analytics' },
      { status: 500 }
    );
  }
}
