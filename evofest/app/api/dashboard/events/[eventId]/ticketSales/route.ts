
import { authMiddleware } from '@/lib/middleware/authMiddleware';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/dashboard/events/[eventId]/ticketSales  -   Fetch the ticket sales analytics...
export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN']);
    if ('status' in user) return user;

    // 1. Fetch event schedules and ticket types
    const schedules = await prisma.eventSchedule.findMany({
      where: { eventId },
      include: {
        dailyTickets: {
          include: {
            bookings: {
              select: { quantity: true, totalPrice: true, createdAt: true }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    let totalTicketsSold = 0;
    let totalRevenue = 0;
    const typeStats: Record<string, { sold: number; revenue: number; available: number }> = {};
    const dateWiseStats: Record<string, Record<string, number>> = {};
    const trend: Record<string, { quantity: number; revenue: number }> = {};

    for (const schedule of schedules) {
      const date = schedule.date.toISOString().split('T')[0];
      if (!dateWiseStats[date]) dateWiseStats[date] = {};

      for (const ticket of schedule.dailyTickets) {
        const type = ticket.type;
        const sold = ticket.bookings.reduce((sum, b) => sum + b.quantity, 0);
        const revenue = ticket.bookings.reduce((sum, b) => sum + b.totalPrice, 0);

        // Totals
        totalTicketsSold += sold;
        totalRevenue += revenue;

        // By type
        if (!typeStats[type]) {
          typeStats[type] = { sold: 0, revenue: 0, available: 0 };
        }
        typeStats[type].sold += sold;
        typeStats[type].revenue += revenue;
        typeStats[type].available += ticket.quantity - sold;

        // By date
        if (!dateWiseStats[date][type]) dateWiseStats[date][type] = 0;
        dateWiseStats[date][type] += sold;

        // Trend data (createdAt level)
        for (const booking of ticket.bookings) {
          const createdDate = booking.createdAt.toISOString().split('T')[0];
          if (!trend[createdDate]) trend[createdDate] = { quantity: 0, revenue: 0 };
          trend[createdDate].quantity += booking.quantity;
          trend[createdDate].revenue += booking.totalPrice;
        }
      }
    }

    // Best selling type
    const bestSellingType = Object.entries(typeStats).reduce((max, [type, stats]) =>
      stats.sold > max.sold ? { type, ...stats } : max,
      { type: '', sold: 0, revenue: 0, available: 0 }
    );

    // Peak sales day
    const peakSalesDay = Object.entries(trend).reduce((max, [date, stats]) =>
      stats.quantity > max.quantity ? { date, ...stats } : max,
      { date: '', quantity: 0, revenue: 0 }
    );

    return NextResponse.json({
      totalTicketsSold,
      totalRevenue,
      typeStats,
      dateWiseStats,
      trend,
      bestSellingType,
      peakSalesDay
    });
  } catch (error) {
    console.error('[EVENT_DASHBOARD_GET]', error);
    return NextResponse.json({ status: 500, message: 'Internal Server Error' });
  }
}
