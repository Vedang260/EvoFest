import { z } from "zod";

// Base date schema (no transform)
const baseDateSchema = z.string().datetime({ offset: true }).or(z.date());

// Date schema with transform (for validation)
const dateSchema = baseDateSchema.transform((val) => new Date(val));

// Base event schedule schema (no transform applied)
const baseEventScheduleSchema = z.object({
  date: baseDateSchema, // use baseDateSchema here
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  capacity: z.number().positive('Capacity must be a positive number'),
}).refine((data) => data.startTime < data.endTime, {
  message: "End Time must be after start time"
});

// Extended schema with the transformed date (override the `date` field)
export const EventScheduleSchema = baseEventScheduleSchema.innerType().extend({
  date: dateSchema,
});
