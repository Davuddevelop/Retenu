import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    // Ignore static files, images, setup, login, etc
    if (
        request.nextUrl.pathname.startsWith('/_next') ||
        request.nextUrl.pathname.startsWith('/auth') ||
        request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/signup') ||
        request.nextUrl.pathname.startsWith('/favicon.ico') ||
        // Temporarily allow webhook without auth as it validates its own signature
        request.nextUrl.pathname.startsWith('/api/stripe/webhook')
    ) {
        return NextResponse.next()
    }

    // Check for guest mode cookie - allows access without authentication
    const guestMode = request.cookies.get('guest_mode')?.value === 'true'
    if (guestMode) {
        return NextResponse.next()
    }

    // Determine if it's an API route or an app route
    const isApiRoute = request.nextUrl.pathname.startsWith('/api')
    const isAppRoute = request.nextUrl.pathname.startsWith('/app')

    // Allow app routes without auth - DataProvider loads demo data automatically
    // This enables "Try Live Demo" without login friction
    if (isAppRoute) {
        return NextResponse.next();
    }

    // If it doesn't match the routes we want to protect, explicitly allow it for now.
    if (!isApiRoute) {
        return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (
        !user &&
        (isApiRoute || isAppRoute)
    ) {
        if (isApiRoute) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
