import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes and their required roles
const protectedRoutes = {
    '/browse-vehicles': ['user', 'owner', 'admin'],
    '/become-owner': ['user'],
    '/dashboard/user': ['user', 'owner', 'admin'],
    '/dashboard/owner': ['owner', 'admin'],
    '/dashboard/admin': ['admin'],
    '/vehicles': ['user', 'owner', 'admin'],
    '/bookings': ['user', 'owner', 'admin'],
    '/profile': ['user', 'owner', 'admin'],
}

// Define public routes that should redirect to dashboard if logged in
const publicRoutes = ['/login', '/register', '/']

// Define routes that require KYC verification
const kycRequiredRoutes = ['/browse-vehicles', '/bookings', '/vehicles']

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value
    const { pathname } = request.nextUrl

    // Check if the path is a protected route (excluding /api routes)
    const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
        pathname.startsWith(route) && !pathname.startsWith('/api')
    )

    // Check if the path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname === route)

    // If no token and trying to access protected route, redirect to login
    if (!token && isProtectedRoute) {
        const url = new URL('/login', request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    // If has token and trying to access public route, redirect to dashboard
    if (token && isPublicRoute) {
        // We can't verify the token here due to Edge runtime limitations,
        // so we'll just redirect to a default dashboard.
        // Actual role-based redirection will happen on the dashboard page.
        return NextResponse.redirect(new URL('/dashboard/user', request.url))
    }

    // Allow the request to proceed for all other cases.
    // Role-based access and KYC verification will be handled on the server-side
    // within the page components or API routes.
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
} 