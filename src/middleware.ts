import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function authMiddleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', decoded.userId); // Attach userId to headers

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/transactions/:path*'], // Protect any transaction endpoints
};
