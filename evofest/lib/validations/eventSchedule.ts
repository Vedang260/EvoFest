import { z } from 'zod';

const dateSchema = z
  .string()
  .datetime({ offset: true })
  .or(z.date())
  .transform((val) => new Date(val));

export const EventScheduleSchema = z.object({
    eventId: z.string().min(1, "EventId is required"),
    date: dateSchema,
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
}).refine((data) => data.startTime < data.endTime, {
    message: "End Time must be after start time"
});