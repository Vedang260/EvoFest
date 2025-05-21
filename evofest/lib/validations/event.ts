import { z } from 'zod';

// Enums from Prisma schema
const EventCategoryEnum = z.enum([
  'MUSIC', 'SPORTS', 'COMEDY', 'WORKSHOP', 'CONFERENCE', 'PARTIES',
  'ARCADE', 'ART', 'FOOD', 'FESTIVAL', 'BUSINESS', 'TECH'
]);

const EventStatusEnum = z.enum(['PUBLISHED', 'CANCELLED', 'COMPLETED']);

// Zod Schema for Event Input Validation
export const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: EventCategoryEnum,
  venue: z.string().min(1, "Venue is required"),
  media: z.array(z.string().url("Each media item must be a valid URL")),
  status: EventStatusEnum.optional().default('PUBLISHED'),
  startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "startDate must be a valid ISO date string"
  }),
  endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "endDate must be a valid ISO date string"
  }),
  prohibitedItems: z.array(z.string()).optional(),
  termsAndConditions: z.array(z.string()).optional(),
  capacity: z.number().int().positive("Capacity must be a positive integer"),
  organizerId: z.string().min(1, "Organizer ID is required")
});
