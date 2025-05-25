import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z
        .string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
    role: z.enum(["ORGANIZER", "STAFF", "ATTENDEE", "ADMIN"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email Address"),
  password: z.string().min(6, "Password must be 6 characters long"),
});