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
    // '/demo' is handled specially in middleware - sets cookie and redirects
    '/pricing',
    '/privacy',
    '/security',
    '/terms',
]

export async function middleware(request: NextRequest) {
    try {
        const pathname = request.nextUrl.pathname

        // Special handling for /demo route - set guest mode and redirect
        if (pathname === '/demo') {
            const response = NextResponse.redirect(new URL('/app', request.url))
            response.cookies.set('guest_mode', 'true', {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
                sameSite: 'lax',
            })
            return response
        }

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

        // Check for guest mode cookie first - this is our fallback
        const isGuestMode = request.cookies.get('guest_mode')?.value === 'true'

        // Check if Supabase is configured
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        // If Supabase is not configured, fall back to cookie-based guest mode check
        if (!supabaseUrl || !supabaseAnonKey) {
            if (isGuestMode && isAppRoute) {
                return NextResponse.next()
            }

            if (isApiRoute) {
                return NextResponse.json(
                    { error: 'Unauthorized', message: 'Authentication required' },
                    { status: 401 }
                )
            }

            // Redirect to login for app routes when Supabase not configured
            const loginUrl = request.nextUrl.clone()
            loginUrl.pathname = '/login'
            loginUrl.searchParams.set('redirect', pathname)
            return NextResponse.redirect(loginUrl)
        }

        // Create Supabase client for auth check
        let supabaseResponse = NextResponse.next({ request })
        let user = null

        try {
            const supabase = createServerClient(
                supabaseUrl,
                supabaseAnonKey,
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

            const { data } = await supabase.auth.getUser()
            user = data?.user ?? null
        } catch (error) {
            console.error('Middleware Supabase error:', error)
            // If Supabase fails, fall back to guest mode check
        }

        // No authenticated user = check guest mode or unauthorized
        if (!user) {
            // Guest mode users can access app routes
            if (isGuestMode && isAppRoute) {
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
    } catch (error) {
        // Catch-all: never let middleware crash
        console.error('Middleware fatal error:', error)
        // Allow request through on error to prevent blocking users
        return NextResponse.next()
    }
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
