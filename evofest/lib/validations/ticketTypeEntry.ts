import { z } from 'zod';

const TicketTypeEnum = z.enum([
  'GENERAL', 'VIP', 'FIRST50', 'FIRST100'
]);

export const ticketTypeEntrySchema = z.object({
    eventId: z.string().min(1, "EventId is required"),
    type: TicketTypeEnum,
    price: z.number().int().positive("Price must be a positive integer"),
    quantity: z.number().int().positive("QUntity must be a positive integer")
});