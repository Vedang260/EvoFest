import { z } from 'zod';

const TicketTypeEnum = z.enum([
  'GENERAL', 'VIP', 'FIRST50', 'FIRST100'
]);

export const dailyTicketTypeEntrySchema = z.object({
    eventScheduleId: z.string().min(1, "EventScheduleId is required"),
    type: TicketTypeEnum,
    price: z.number().int().positive("Price must be a positive integer"),
    quantity: z.number().int().positive("QUntity must be a positive integer")
});