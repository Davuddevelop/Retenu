// src/app/api/demo/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    // Create redirect response to /app
    const url = new URL('/app', request.url);
    const response = NextResponse.redirect(url);

    // Set guest mode cookie
    response.cookies.set('guest_mode', 'true', {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
        httpOnly: false, // Allow JS to read it
    });

    return response;
}
