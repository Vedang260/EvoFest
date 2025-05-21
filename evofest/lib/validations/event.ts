import { z } from 'zod';

const EventCategory = z.enum(["MUSIC", "SPORTS", "COMEDY", "WORKSHOP", "CONFERENCE", "PARTIES", "ARCADE", "ART", "FOOD", "FESTIVAL", "BUSINESS", "TECH"]);

const dateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.date())
  .transform((val) => new Date(val));

export const eventSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
    description: z.string().min(10, 'Description is too short').max(2000, 'Description is too long'),
    category: EventCategory,
    venue: z.string().min(3, 'Venue must be at least 3 characters'),
    media: z.array(z.string().url("Invalid URL")).max(10, "Too many media items"),
    startDate: dateSchema.refine((date) => date > new Date(), {
      message: "Start date must be in the future",
    }),
    endDate: dateSchema,
    prohibitedItems: z.array(z.string().max(50)).max(10).optional(),
    termsAndConditions: z.array(z.string().max(500)).max(20).optional(),
    capacity: z.number().int().positive("Capacity must be positive"),
}).refine((data) => data.endDate >= data.startDate, {
  message: "End Date must be after the start Date",
  path: ["endDate"]
});

export type EventFormValues = z.infer<typeof eventSchema>;