import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events - Fetch all events
export async function GET(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        const events = await prisma.event.findMany({
            select: {
                eventId: true,
                title: true,
                media: true,
                category: true,
                startDate: true,
                endDate: true,
                venue: true,
            },
            orderBy: {
                startDate: 'asc',
            },
        });

        return NextResponse.json({
            success: true,
            message: 'All events are fetched successfully',
            events: events
        })
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch events' 
        })
    }
}