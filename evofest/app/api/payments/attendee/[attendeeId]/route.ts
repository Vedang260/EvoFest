import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/payments/attendee/[attendeeId] - Fetch the payments done by a particular attendee
export async function GET( request: Request,
  { params }: { params: { attendeeId: string } }) {
    try {
        const attendeeId = params.attendeeId;
        const user = await authMiddleware(request, ['ATTENDEE']);

        if ('status' in user) return user;

        const payment = await prisma.payment.findMany({
            where: { attendeeId },
            orderBy:{
                paidDate: 'desc'
            }
        });

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