import { verify } from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  role: string;
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is undefined!");
      return null;
    }

    return verify(token, process.env.JWT_SECRET) as AuthPayload;
  } catch (err) {
    console.error("JWT Verification Error:", err);
    return null;
  }
}

