import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { getServerSession } from 'next-auth'
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events - Fetch all events with schedules and ticket types
export async function GET(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        const events = await prisma.event.findMany({
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
            message: 'All events are fetched successfully'
        })
    } catch (error) {
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch events' 
        })
    }
}
