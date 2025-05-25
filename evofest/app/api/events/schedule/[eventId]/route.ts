import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const user = await authMiddleware(request, ['ORGANIZER', 'ATTENDEE']);
    if ('status' in user) return user;

    const eventSchedules = await prisma.eventSchedule.findMany({
      where: { eventId },
      include: {
        dailyTickets: true
      }
    });

    if (eventSchedules.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Event Schedule does not exist'
      });
    }

    // Step 1: Get all DailyTicketTypeEntry IDs
    const allTicketTypeEntryIds = eventSchedules.flatMap(schedule =>
      schedule.dailyTickets.map(ticket => ticket.dailyTicketTypeEntryId)
    );

    // Step 2: Group bookings to find total booked quantity per ticket type
    const bookings = await prisma.booking.groupBy({
      by: ['dailyTicketTypeEntryId'],
      _sum: {
        quantity: true
      },
      where: {
        dailyTicketTypeEntryId: {
          in: allTicketTypeEntryIds
        }
      }
    });

    // Step 3: Create a map of booked quantities
    const bookedQuantityMap: Record<string, number> = {};
    bookings.forEach(booking => {
      bookedQuantityMap[booking.dailyTicketTypeEntryId] = booking._sum.quantity || 0;
    });

    // Step 4: Enrich each schedule with daily ticket booked/remaining & schedule-level totals
    const enrichedSchedules = eventSchedules.map(schedule => {
      let totalBooked = 0;

      const updatedDailyTickets = schedule.dailyTickets.map(ticket => {
        const booked = bookedQuantityMap[ticket.dailyTicketTypeEntryId] || 0;
        totalBooked += booked;

        return {
          ...ticket,
          booked,
          remaining: ticket.quantity - booked
        };
      });

      return {
        ...schedule,
        dailyTickets: updatedDailyTickets,
        totalBooked,
        remainingCapacity: schedule.capacity - totalBooked
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Event Schedules are fetched successfully',
      event: enrichedSchedules
    });

  } catch (error: any) {
    console.error('error:', error.message);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch event schedule'
    });
  }
}
