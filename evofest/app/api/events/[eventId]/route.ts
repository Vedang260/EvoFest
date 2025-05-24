import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events/[eventId] - Fetch the details of the Event
export async function GET( request: Request,
  { params }: { params: { eventId: string } }) {
    try {
        const eventId = params.eventId;
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        const event = await prisma.event.findUnique({
            where: { eventId },
            include: {
                eventSchedule: {
                    select: {
                        date: true,
                        startTime: true,
                        endTime: true
                    }
                }
            }
        })

        if (!event) {
            return NextResponse.json({ 
                success: false,
                message: 'Event does not exist'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Event details are fetched successfully',
            event: event
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch event' 
        })
    }
}