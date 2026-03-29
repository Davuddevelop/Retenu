import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
    '/_next',
    '/auth',
    '/login',
    '/signup',
    '/favicon.ico',
    '/api/stripe/webhook', // Validates its own signature
    '/', // Landing page
    '/landing-v2',
    '/landing-test',
    '/hero-demo',
    '/demo',
    '/pricing',
    '/privacy',
    '/security',
    '/terms',
]

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // Allow public routes without authentication
    const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    )

    if (isPublicRoute) {
        return NextResponse.next()
    }

    // Protected routes require authentication
    const isApiRoute = pathname.startsWith('/api')
    const isAppRoute = pathname.startsWith('/app')

    // If not a protected route, allow through
    if (!isApiRoute && !isAppRoute) {
        return NextResponse.next()
    }

    // Create Supabase client for auth check
    let supabaseResponse = NextResponse.next({ request })

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
                    supabaseResponse = NextResponse.next({ request })
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
    const { data: { user } } = await supabase.auth.getUser()

    // Check for guest mode - but user must still have a valid anonymous session
    const isGuestMode = request.cookies.get('guest_mode')?.value === 'true'

    // No authenticated user (including anonymous) = unauthorized
    if (!user) {
        // For guest mode without session, we need to let them through to get anonymous auth
        // But only for app routes, not API routes
        if (isGuestMode && isAppRoute) {
            // Allow through - AuthProvider will handle anonymous auth
            return NextResponse.next()
        }

        if (isApiRoute) {
            return NextResponse.json(
                { error: 'Unauthorized', message: 'Authentication required' },
                { status: 401 }
            )
        }

        // Redirect to login for app routes
        const loginUrl = request.nextUrl.clone()
        loginUrl.pathname = '/login'
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // User is authenticated - add user ID to headers for downstream use
    supabaseResponse.headers.set('x-user-id', user.id)

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
