import createMiddleware from 'next-intl/middleware';
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import { STAFF_ROLES } from './lib/public-selects';
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

// Registration documents contain athletes' personal data: only signed-in staff may open them
const PRIVATE_UPLOADS_PREFIX = '/uploads/registrations/';

async function guardPrivateUpload(req: NextRequest): Promise<NextResponse> {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const role = typeof token?.role === 'string' ? token.role : null;
    if (!role || !(STAFF_ROLES as readonly string[]).includes(role)) {
        return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.next();
}

export default function middleware(req: NextRequest): NextResponse | Response | Promise<NextResponse> {
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith(PRIVATE_UPLOADS_PREFIX)) {
        return guardPrivateUpload(req);
    }

    // Check if the path is an admin path (handling locale prefix)
    // Simple check for admin in path, assuming /admin or /ru/admin
    if (pathname.includes('/admin')) {
        return (authMiddleware as (req: NextRequest) => NextResponse | Response)(req);
    }
    return handleI18n(req);
}

export const config = {
    matcher: ['/', '/(ru|kk|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)', '/uploads/registrations/:path*']
};
