import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/payments/[paymentId] - Fetch the details of the Event
export async function GET( request: Request,
  { params }: { params: { paymentId: string } }) {
    try {
        const paymentId = params.paymentId;
        const user = await authMiddleware(request, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);

        if ('status' in user) return user;

        const payment = await prisma.payment.findUnique({
            where: { paymentId },
            include: {
                attendee:{
                    select: {
                        username: true,
                        email: true
                    }
                }
            }
        })

        if (!payment) {
            return NextResponse.json({ 
                success: false,
                message: 'payment does not exist'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'payment details are fetched successfully',
            payment: payment
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch payment details' 
        })
    }
}