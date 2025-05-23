// lib/middleware/authMiddleware.ts
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import type { NextRequest } from 'next/server';

export async function authMiddleware(
  request: Request,
  allowedRoles: string[] = []
) {
  const authHeader = request.headers.get('authorization')?.trim();

  console.log("Authorization Header:", authHeader);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader?.split(' ')?.[1]?.trim();
  console.log("Extracted Token:", token);
if (!token) {
  return NextResponse.json({ success: false, message: 'Unauthorized - Token missing' }, { status: 401 });
}
  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json({ success: false, message: 'Invalid or expired token' }, { status: 403 });
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ success: false, message: 'Forbidden - Insufficient role' }, { status: 403 });
  }

  return user; // You can use this inside your handler
}
