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
        const { schedules, eventBody } = body;

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
                ...eventBody,
                organizer: {
                    connect: { userId: user.userId },
                },
            },
        });

        const eventId = newEvent.eventId;

        // Process each schedule with ticketTypes
        for (const schedule of schedules) {
            const { ticketTypes, ...scheduleData } = schedule;

            // Create schedule and get ID
            const createdSchedule = await prisma.eventSchedule.create({
                data: {
                    ...scheduleData,
                    eventId,
                },
            });

            const scheduleId = createdSchedule.eventScheduleId;

            // Insert ticket types for this schedule
            if (Array.isArray(ticketTypes) && ticketTypes.length > 0) {
                await prisma.dailyTicketTypeEntry.createMany({
                    data: ticketTypes.map(ticket => ({
                        ...ticket,
                        eventScheduleId: scheduleId,
                    })),
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: "Event, schedule, and ticket types created successfully"
        });
    } catch (error) {
        console.error("Error in creating a new Event:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create a new Event" 
        });
    }
}