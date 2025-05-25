import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

export const config = {
  api: { bodyParser: false }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const prisma = new PrismaClient();

export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();
  const body = Buffer.from(rawBody);
  const sig = (await headers()).get('stripe-signature');

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error('❌ Invalid signature:', err.message);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    try {
      const attendeeId = metadata?.attendeeId;
      const paymentId = metadata?.paymentId;
        if (!attendeeId || !paymentId) {
            throw new Error("attendeeId or paymentId is missing");
        }
      let tickets, guests;
      if(metadata?.tickets){
        tickets = JSON.parse(metadata?.tickets);
      }
      if(metadata?.guests){
        guests = JSON.parse(metadata?.guests);
      }

      // 1. Mark payment as successful
      await prisma.payment.update({
        where: { paymentId },
        data: {
          status: 'COMPLETED',
          paidDate: new Date()
        }
      });

      // 2. Create bookings and a map for ticketEntryId -> bookingId
      const bookingMap: Record<string, string> = {};

      for (const ticket of tickets) {
        const booking = await prisma.booking.create({
          data: {
            attendeeId: attendeeId,
            paymentId: paymentId,
            dailyTicketTypeEntryId: ticket.dailyTicketTypeEntryId,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice
          }
        });

        bookingMap[ticket.dailyTicketTypeEntryId] = booking.bookingId;
      }

      // 3. Create guests and generate QR code for each
      for (const guest of guests) {
        const bookingId = bookingMap[guest.dailyTicketTypeEntryId];

        const guestRecord = await prisma.guest.create({
          data: {
            bookingId,
            name: guest.name,
            age: parseInt(guest.age),
            gender: guest.gender,
            email: guest.email,
            phoneNumber: guest.phone,
            qrCode: '' // placeholder
          }
        });

        // Generate QR Code containing guestId or any identifying info
        const qrData = `guest:${guestRecord.guestId}`;
        const qrCodeURL = await QRCode.toDataURL(qrData);

        // Update guest with QR code
        await prisma.guest.update({
          where: { guestId: guestRecord.guestId },
          data: { qrCode: qrCodeURL }
        });
      }

      return NextResponse.json({ success: true, message: 'Your tickets are booked' });
    } catch (err: any) {
      console.error('❌ Webhook handler error:', err.message);
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
