import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import nodemailer from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-04-30.basil' });
const endpointSecret = process.env.WEBHOOK_SECRET_KEY!;
const prisma = new PrismaClient();

// Initialize email transporter once (better to move to separate config file)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function POST(req: Request) {
  const rawBody = await req.arrayBuffer();
  const body = Buffer.from(rawBody);
  const sig = (await headers()).get('stripe-signature');

  try {
    const event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);

    if (event.type === 'checkout.session.completed') {
      return await handleSuccessfulCheckout(event);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('❌ Webhook error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

async function handleSuccessfulCheckout(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const metadata = session.metadata;

  if (!metadata?.attendeeId || !metadata?.paymentId) {
    throw new Error("Missing required metadata");
  }

  const { attendeeId, paymentId } = metadata;
  const tickets = metadata.tickets ? JSON.parse(metadata.tickets) : [];
  const guests = metadata.guests ? JSON.parse(metadata.guests) : [];

  return await prisma.$transaction(async (prisma) => {
    // 1. Update payment status
    await prisma.payment.update({
      where: { paymentId },
      data: { status: 'COMPLETED', paidDate: new Date() }
    });

    // 2. Create all bookings first (returns array of created bookings)
    const bookings = await Promise.all(
      tickets.map((ticket: any) =>
        prisma.booking.create({
          data: {
            attendeeId,
            paymentId,
            dailyTicketTypeEntryId: ticket.dailyTicketTypeEntryId,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice
          }
        })
      )
    );

    // Create mapping for quick lookup
    const bookingMap = Object.fromEntries(
      bookings.map(b => [b.dailyTicketTypeEntryId, b.bookingId])
    );

    // 3. Process all guests with QR codes
    const guestProcessing = guests.map(async (guest: any) => {
      const bookingId = bookingMap[guest.dailyTicketTypeEntryId];
      if (!bookingId) throw new Error(`No booking found for ticket ${guest.dailyTicketTypeEntryId}`);

      // Create guest with QR code in single operation
      const guestRecord = await prisma.guest.create({
        data: {
          booking: { connect: { bookingId } },
          name: guest.name,
          age: parseInt(guest.age),
          gender: guest.gender,
          email: guest.email,
          phoneNumber: guest.phone,
        }
      });

      // Step 2: Generate QR code using guestId
      const qrData = `evofest:${guestRecord.guestId}:${guest.email}`;
      const qrCodeURL = await QRCode.toDataURL(qrData);

      // Step 3: Update the guest with the generated QR code
      await prisma.guest.update({
        where: { guestId: guestRecord.guestId },
        data: { qrCode: qrCodeURL }
      });

      // Send email (don't await, run in background)
      transporter.sendMail({
        from: '"EvoFest" <tickets@evofest.com>',
        to: guest.email,
        subject: 'Your EvoFest Ticket',
        html: generateEmailTemplate(guest.name, qrCodeURL),
        attachments: [{
          filename: 'ticket-qr.png',
          content: qrCodeURL.split('base64,')[1],
          encoding: 'base64'
        }]
      }).catch(e => console.error('Email failed:', e));

      return guestRecord;
    });

    await Promise.all(guestProcessing);
    return NextResponse.json({ success: true });
  });
}

function generateEmailTemplate(name: string, qrCodeURL: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Hello ${name},</h2>
      <p>Your EvoFest ticket is attached!</p>
      <p>Present this QR code at the entrance:</p>
      <img src="${qrCodeURL}" alt="QR Code" style="display: block; margin: 20px auto; width: 200px;"/>
      <p>For any questions, contact support@evofest.com</p>
      <p style="margin-top: 30px; font-size: 0.9em; color: #666;">
        EvoFest Team
      </p>
    </div>
  `;
}

export const config = {
  api: { bodyParser: false }
};