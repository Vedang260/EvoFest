import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { eventSchema } from "@/lib/validations/event";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER']);

        if ('status' in user) return user;
        
        // Step 2: Parse request
        const body = await request.json();
        console.log("Incoming request body:", body);

        // Extract nested fields
        const { ticketTypes, schedule, ...eventData } = body;

        // Add organizerId to event
        const eventBody = { ...eventData};

        // Step 3: Validate only event part
        const result = eventSchema.safeParse(eventBody);

        if (!result.success) {
            return NextResponse.json({
                success: false,
                errors: result.error.flatten().fieldErrors,
            });
        }

        // Step 4: Create event
        const newEvent = await prisma.event.create({
            data: {
                ...eventData,
                organizer: {
                    connect: { userId: user.userId },
                },
            },
        });

        const eventId = newEvent.eventId;

        // Step 5: Insert ticketTypes (if present)
        if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
            await prisma.ticketTypeEntry.createMany({
                data: ticketTypes.map((ticket) => ({
                    ...ticket,
                    eventId,
                })),
            });
        }

        // Step 6: Insert schedule (if present)
        if (Array.isArray(schedule) && schedule.length > 0) {
            await prisma.eventSchedule.createMany({
                data: schedule.map((entry) => ({
                    ...entry,
                    eventId,
                })),
            });
        }

        return NextResponse.json({
            success: true,
            message: "Event, schedule, and ticket types created successfully",
            eventId,
        });
    } catch (error) {
        console.error("Error in creating a new Event:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create a new Event" 
        });
    }
}