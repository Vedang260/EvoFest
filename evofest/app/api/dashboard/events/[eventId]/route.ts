import { NextResponse } from 'next/server';
import { PaymentStatus, PrismaClient } from '@prisma/client';
import { authMiddleware } from '@/lib/middleware/authMiddleware';

const prisma = new PrismaClient();

// GET /api/dashboard/events/[eventId] - Fetch the overview of the Event Dashboard
export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN']);

    if ('status' in user) return user;

    // 1. Basic Stats
    const [totalEventDays, totalTicketTypes, totalCapacity, totalBookings, totalGuests, totalRevenue, totalCheckIns] = await Promise.all([
      prisma.eventSchedule.count({ where: { eventId } }),
      prisma.dailyTicketTypeEntry.count({
        where: {
            eventSchedule: {
                eventId,
            },
        },
      }),

      prisma.eventSchedule.aggregate({
        where: { eventId },
        _sum: { capacity: true },
      }),
      prisma.booking.count({
        where: {
          dailyTicketTypeEntry: { eventSchedule: { eventId } },
        },
      }),
      prisma.guest.count({
        where: {
          booking: {
            dailyTicketTypeEntry: { eventSchedule: { eventId } },
          },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.COMPLETED,
          booking: {
            some: {
              dailyTicketTypeEntry: { eventSchedule: { eventId } },
            },
          },
        },
        _sum: { amount: true },
      }),
      prisma.checkIn.count({ where: { eventId } }),
    ]);

    // 2. Bookings over time (daily)
    const bookingsOverTime = await prisma.booking.findMany({
      where: {
        dailyTicketTypeEntry: { eventSchedule: { eventId } },
      },
      select: { createdAt: true },
    });

    // Group by date
    const bookingsByDate: Record<string, number> = {};
    bookingsOverTime.forEach(({ createdAt }) => {
      const date = createdAt.toISOString().split('T')[0];
      bookingsByDate[date] = (bookingsByDate[date] || 0) + 1;
    });

    const ticketRevenue = await prisma.dailyTicketTypeEntry.findMany({
        where: {
            eventSchedule: { eventId },
        },
        select: {
            type: true,
            bookings: {
                select: {
                    payment: true, // payment is a single object, not an array
                },
            },
        },
    });

    const revenueByTicketType: Record<string, number> = {};

    ticketRevenue.forEach(({ type, bookings }) => {
        let sum = 0;
        bookings.forEach(({ payment }) => {
            if (payment?.status === PaymentStatus.COMPLETED) {
            sum += payment.amount;
            }
        });
        revenueByTicketType[type] = (revenueByTicketType[type] || 0) + sum;
    });

    // 4. Ticket Type Distribution
    const ticketTypeCounts = await prisma.dailyTicketTypeEntry.groupBy({
      by: ['type'],
      _sum: { quantity: true },
      where: { eventSchedule: { eventId } },
    });

    // 5. Heatmap Check-in per Hour
    const checkInTimes = await prisma.checkIn.findMany({
      where: { eventId },
      select: { checkInAt: true },
    });

    const checkInHeatmap: Record<string, number> = {};
    checkInTimes.forEach(({ checkInAt }) => {
      const day = checkInAt.toISOString().split('T')[0];
      const hour = checkInAt.getUTCHours();
      const key = `${day}-${hour}`;
      checkInHeatmap[key] = (checkInHeatmap[key] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalEventDays,
        totalTicketTypes,
        totalCapacity: totalCapacity._sum.capacity || 0,
        totalBookings,
        totalGuests,
        totalRevenue: totalRevenue._sum.amount || 0,
        totalCheckIns,
        checkInPercentage: totalBookings > 0 ? (totalCheckIns / totalBookings) * 100 : 0,
        trends: {
          bookingsByDate,
          revenueByTicketType,
          ticketTypeCounts,
          checkInHeatmap,
        },
      },
    });
  } catch (error: any) {
    console.error('error: ', error.message);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch event dashboard data',
    });
  }
}