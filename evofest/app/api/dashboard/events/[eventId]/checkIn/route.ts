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
    const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN']);
    if ('status' in user) return user;

    // 1. Total Guests
    const bookings = await prisma.booking.findMany({
      where: {
        dailyTicketTypeEntry: {
          eventSchedule: {
            eventId: eventId,
          },
        },
      },
      include: {
        guests: {
          select: { guestId: true },
        },
      },
    });

    const totalGuests = bookings.reduce(
      (acc, booking) => acc + booking.guests.length,
      0
    );

    // 2. Total Checked-in Guests
    const checkedInGuests = await prisma.checkIn.count({
      where: {
        eventId: eventId,
      },
    });

    const checkInRate = totalGuests
      ? ((checkedInGuests / totalGuests) * 100).toFixed(2)
      : '0.00';

    // Fetch all check-ins for event once (used in hourly, heatmap, etc.)
    const checkIns = await prisma.checkIn.findMany({
      where: { eventId },
      select: { checkInAt: true },
    });

    // 3. Daily Check-ins (group by day)
    const dailyCountMap = new Map<string, number>();
    checkIns.forEach(({ checkInAt }) => {
      const day = checkInAt.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyCountMap.set(day, (dailyCountMap.get(day) || 0) + 1);
    });
    const dailyCheckins = Array.from(dailyCountMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => a.day.localeCompare(b.day));

    // 4. Hourly Check-ins (group by hour)
    const hourlyCountMap = new Map<string, number>();
    checkIns.forEach(({ checkInAt }) => {
      const hour = checkInAt.toISOString().slice(0, 13) + ':00:00Z'; // e.g. 2025-06-01T14:00:00Z
      hourlyCountMap.set(hour, (hourlyCountMap.get(hour) || 0) + 1);
    });
    const hourlyCheckins = Array.from(hourlyCountMap.entries())
      .map(([hour, count]) => ({ hour, count }))
      .sort((a, b) => a.hour.localeCompare(b.hour));

    // 5. Peak Check-in Hour
    const peakCheckIn = hourlyCheckins.reduce(
      (max, curr) => (curr.count > max.count ? curr : max),
      { hour: '', count: 0 }
    );

    // 6. Daily Attendance = same as daily checkins
    const dailyAttendance = dailyCheckins;

    // 7. Heatmap Data (Check-ins by Day & Hour)
    const heatmapMap = new Map<string, Map<number, number>>(); // day -> (hour -> count)
    checkIns.forEach(({ checkInAt }) => {
      const day = checkInAt.toISOString().slice(0, 10);
      const hour = checkInAt.getUTCHours();
      if (!heatmapMap.has(day)) heatmapMap.set(day, new Map());
      const hourMap = heatmapMap.get(day)!;
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    const heatmapData: { day: string; hour: number; count: number }[] = [];
    heatmapMap.forEach((hourMap, day) => {
      hourMap.forEach((count, hour) => {
        heatmapData.push({ day, hour, count });
      });
    });
    heatmapData.sort((a, b) =>
      a.day === b.day ? a.hour - b.hour : a.day.localeCompare(b.day)
    );

    // 8. Guest List with check-in time
    const guestList = await prisma.guest.findMany({
      where: {
        booking: {
          dailyTicketTypeEntry: {
            eventSchedule: {
              eventId: eventId,
            },
          },
        },
      },
      select: {
        guestId: true,
        name: true,
        email: true,
        phoneNumber: true,
        gender: true,
        age: true,
        checkIns: {
          where: { eventId },
          select: { checkInAt: true },
        },
      },
    });

    const formattedGuestList = guestList.map((guest) => ({
      guestId: guest.guestId,
      name: guest.name,
      email: guest.email,
      phoneNumber: guest.phoneNumber,
      gender: guest.gender,
      age: guest.age,
      checkInAt: guest.checkIns[0]?.checkInAt || null,
    }));

    return NextResponse.json({
      totalGuests,
      checkedInGuests,
      checkInRate: Number(checkInRate),
      dailyCheckins,
      hourlyCheckins,
      peakCheckIn: peakCheckIn.count > 0 ? peakCheckIn : null,
      dailyAttendance,
      heatmapData,
      guestList: formattedGuestList,
    });
  } catch (error: any) {
    console.error('error: ', error.message);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch event dashboard data',
    });
  }
}
