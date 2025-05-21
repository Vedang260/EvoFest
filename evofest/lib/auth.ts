// lib/auth.ts
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return null;
  }
}
