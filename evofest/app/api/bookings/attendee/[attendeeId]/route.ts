import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/bookings/attendee/[attendeeId] - Fetch the bookings done by Attendee
export async function GET( request: Request,
  { params }: { params: { attendeeId: string } }) {
    try {
        const attendeeId = params.attendeeId;
        const user = await authMiddleware(request, ['ATTENDEE']);

        if ('status' in user) return user;

        const bookings = await prisma.booking.findMany({
            include: {
                guests: true,
                dailyTicketTypeEntry: {
                    select: {
                        type: true,
                        eventSchedule: {
                            select: {
                                    date: true,
                                    startTime: true,
                                    endTime: true,
                                    event: {
                                    select: {
                                        title: true,
                                        venue: true,
                                        category: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });



        if (!bookings) {
            return NextResponse.json({ 
                success: false,
                message: 'You have not made any bookings yet'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Your bookings are fetched',
            bookings: bookings
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch payment details' 
        })
    }
}