import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// POST /api/events/[eventId]/check-in -> Craete a new Check-in of Guest for the Event
export async function POST( request: Request,
  { params }: { params: { eventId: string } }) {
    try {
        const eventId = params.eventId;
        const user = await authMiddleware(request, ['STAFF']);

        if ('status' in user) return user;

        // Step 2: Parse request
        const body = await request.json();
        console.log("Incoming request body:", body);

        // Extract nested fields
        const { guest } = body;

        const isGuestPresent = await prisma.guest.findUnique({
            where: { guestId: guest.guestId }
        });

        if (!isGuestPresent) {
            return NextResponse.json({ 
                success: false,
                message: 'Guest does not exist'
            })
        }

        const newCheckIn = await prisma.checkIn.create({
            data: {
                event: {
                    connect: { eventId }
                },
                guest: {
                    connect: { guestId: guest.guestId }
                }
            },
        });

        return NextResponse.json({
            success: true,
            message: 'Guest is checked-in successfully',
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch event' 
        })
    }
}