import { authMiddleware } from '@/lib/middleware/authMiddleware';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: Request) {
  try {
    const user = await authMiddleware(req, ['ORGANIZER', 'ADMIN', 'STAFF', 'ATTENDEE']);
    
    if ('status' in user) return user;
    const body = await req.json();

    const { eventScheduleId, tickets, guests } = body;

    let sum = 0;
    tickets.forEach((ticket: any) => {
        sum += ticket.totalPrice;
    });

    const totalAmount = sum;

    const line_items = tickets.map((ticket: any) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: `${ticket.type} Ticket`,
        },
        unit_amount: Math.round(ticket.totalPrice * 100), // in cents
      },
      quantity: ticket.quantity,
    }));

    // creating a payment
    const payment = await prisma?.payment.create({
        data: {
            attendeeId: user.userId,
            amount: totalAmount,
            paidDate: new Date()
        }
    });

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,

        metadata: {
            attendeeId: user.userId,
            paymentId: payment?.paymentId ?? '', // Stripe metadata values must be strings; fallback to empty if undefined

            // Serialize ticket details
            tickets: JSON.stringify(
                tickets.map((ticket: {
                    type: any;
                    quantity: any;
                    totalPrice: any;
                    dailyTicketTypeEntryId: any;
                }) => ({
                    quantity: ticket.quantity,
                    totalPrice: ticket.totalPrice,
                    dailyTicketTypeEntryId: ticket.dailyTicketTypeEntryId
                }))
            ),

            // Serialize guest details
            guests: JSON.stringify(
                guests.map((guest: {
                    name: any;
                    age: any;
                    gender: any;
                    phone: any;
                    email: any;
                    dailyTicketTypeEntry: any;
                }) => ({
                    name: guest.name,
                    age: guest.age,
                    gender: guest.gender,
                    phone: guest.phone,
                    email: guest.email,
                    dailyTicketTypeEntryId: guest.dailyTicketTypeEntry
                }))
            ),
        },

        success_url: `${process.env.FRONTEND_STRIPE_SECRET_KEY}/payment/success`,
        cancel_url: `${process.env.FRONTEND_STRIPE_SECRET_KEY}/payment/cancel`,
    });

    await prisma?.payment.update({
        where: {
            paymentId: payment?.paymentId
        },
        data: {
            transactionId: session.id
        }
    });

    return NextResponse.json({ 
        success: true,
        message: 'Stripe session is created successfully',
        url: session.url 
    });
  } catch (err: any) {
    console.error('Stripe error', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
