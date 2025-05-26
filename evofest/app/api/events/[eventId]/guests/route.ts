import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events/[eventId]/guests - Fetch the guests of the Event
export async function GET( request: Request,
  { params }: { params: { eventId: string } }) {
    try {
        const eventId = params.eventId;
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        const guests = await prisma.guest.findMany({
            where: {
                booking: {
                    dailyTicketTypeEntry: {
                        eventSchedule: {
                            eventId: eventId,  // filter eventSchedules matching eventId
                        }
                    }
                }
            }
        });

        if (!guests) {
            return NextResponse.json({ 
                success: false,
                message: 'No guests are there'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Guest details are fetched successfully',
            guests: guests
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch event' 
        })
    }
}