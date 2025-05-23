import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events - Fetch all events with schedules and ticket types
export async function GET(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;
        const now = new Date();
        const events = await prisma.event.findMany({
            where: {
                startDate: {
                    gte: now,
                },
            },
            include: {
                schedule: true,
                ticketTypes: true,
            },
            orderBy: {
                startDate: 'asc'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Upcoming events are fetched successfully',
            events: events
        })
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch events' 
        })
    }
}