import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function requireAuth(
  handler: (request: NextRequest, user: JWTPayload, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any) => {
    const token = getAuthToken(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    return handler(request, user, context);
  };
}

export function requireAdmin(
  handler: (request: NextRequest, user: JWTPayload, context?: any) => Promise<NextResponse>
) {
  return requireAuth(async (request: NextRequest, user: JWTPayload, context?: any) => {
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
    return handler(request, user, context);
  });
}
