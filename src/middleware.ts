import createMiddleware from 'next-intl/middleware';
import { withAuth } from "next-auth/middleware";
import { routing } from './navigation';
import { NextRequest, NextResponse } from 'next/server';

const handleI18n = createMiddleware(routing);

const authMiddleware = withAuth(
    function onSuccess(req) {
        return handleI18n(req);
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export default function middleware(req: NextRequest): NextResponse | Response {
    // Check if the path is an admin path (handling locale prefix)
    const pathname = req.nextUrl.pathname;
    // Simple check for admin in path, assuming /admin or /ru/admin
    if (pathname.includes('/admin')) {
        return (authMiddleware as (req: NextRequest) => NextResponse | Response)(req);
    }
    return handleI18n(req);
}

export const config = {
    matcher: ['/', '/(ru|kk|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
