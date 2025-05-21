import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { eventSchema } from "@/lib/validations/event";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

export async function POST(request: Request) {
    try {
        const user = await authMiddleware(request, ['ORGANIZER']);

        if ('status' in user) return user;
        
        const body = await request.json();
        console.log("Incoming request body:", body);

        const eventBody = {...body, organizerId: user.userId};
        const result = eventSchema.safeParse(eventBody);

        if (!result.success) {
            return NextResponse.json(
                { success: false, errors: result.error.flatten().fieldErrors }
            );
        }

        await prisma.event.create({
            data: {
                ...result.data
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "New Event is created successfully" 
        });
    } catch (error) {
        console.error("Error in creating a new Event:", error);
        return NextResponse.json({ 
            success: false, 
            message: "Failed to create a new Event" 
        });
    }
}