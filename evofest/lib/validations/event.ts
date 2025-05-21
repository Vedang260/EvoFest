import { z } from 'zod';

// Enums from Prisma schema
const EventCategoryEnum = z.enum([
  'MUSIC', 'SPORTS', 'COMEDY', 'WORKSHOP', 'CONFERENCE', 'PARTIES',
  'ARCADE', 'ART', 'FOOD', 'FESTIVAL', 'BUSINESS', 'TECH'
]);

const EventStatusEnum = z.enum(['PUBLISHED', 'CANCELLED', 'COMPLETED']);

const TicketTypeEnum = z.enum(["VIP", "GENERAL", "FIRST50", "FIRST100"]);

const eventScheduleSchema = z.array(
  z.object({
    date: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
);

const ticketTypeEntrySchema = z.array(
  z.object({
    type: TicketTypeEnum,
    price: z.number().positive("Price must be positive"),
    quantity: z.number().int().positive("Quantity must be positive integer"),
  })
);

export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: EventCategoryEnum,
  venue: z.string().min(1, "Venue is required"),
  media: z.array(z.string().url("Each media item must be a valid URL")),
  status: EventStatusEnum.optional().default("PUBLISHED"),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "startDate must be a valid ISO date string" }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), { message: "endDate must be a valid ISO date string" }),
  prohibitedItems: z.array(z.string()).optional(),
  termsAndConditions: z.array(z.string()).optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  organizerId: z.string().min(1, "Organizer ID is required"),

  schedule: eventScheduleSchema,
  ticketTypes: ticketTypeEntrySchema,
});
