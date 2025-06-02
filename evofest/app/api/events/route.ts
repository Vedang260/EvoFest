import { NextResponse } from 'next/server'
import { PrismaClient, UserRole } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/events - Fetch all events
export async function GET(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        let events;
        if(user.role === UserRole.ADMIN || user.role === UserRole.ATTENDEE || UserRole.STAFF){
            events = await prisma.event.findMany({
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
        }
        else if(user.role === UserRole.ORGANIZER){
            events = await prisma.event.findMany({
                select: {
                    eventId: true,
                    title: true,
                    media: true,
                    category: true,
                    startDate: true,
                    endDate: true,
                    venue: true,
                },
                where: { organizerId: user.userId},
                orderBy: {
                    startDate: 'asc',
                },
            });
        }

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