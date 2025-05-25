import { NextResponse } from 'next/server'
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "@/lib/middleware/authMiddleware";

const prisma = new PrismaClient();

// GET /api/payments - Fetch all Payments
export async function GET( request: Request) {
    try {
        const user = await authMiddleware(request, ['ADMIN']);

        if ('status' in user) return user;

        const payments = await prisma.payment.findMany({
            include: {
                attendee:{
                    select: {
                        username: true,
                    }
                }
            },
            orderBy: {
                paidDate: 'desc'
            }
        });

        if (!payments) {
            return NextResponse.json({ 
                success: false,
                message: 'payment does not exist'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'payment details are fetched successfully',
            payments: payments
        })
    } catch (error: any) {
        console.error('error: ', error.message)
        return NextResponse.json({ 
            success: false,
            message: 'Failed to fetch payment details' 
        })
    }
}