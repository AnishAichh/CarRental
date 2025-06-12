import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJWT } from './lib/auth'

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

    // Check if the path is a protected route
    const isProtectedRoute = Object.keys(protectedRoutes).some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    // Check if the path is a public route
    const isPublicRoute = publicRoutes.some(route => pathname === route)

    // Check if the path requires KYC
    const requiresKYC = kycRequiredRoutes.some(route =>
        pathname === route || pathname.startsWith(`${route}/`)
    )

    // If no token and trying to access protected route, redirect to login
    if (!token && isProtectedRoute) {
        const url = new URL('/login', request.url)
        url.searchParams.set('from', pathname)
        return NextResponse.redirect(url)
    }

    // If has token and trying to access public route, redirect to appropriate dashboard
    if (token && isPublicRoute) {
        try {
            const payload = await verifyJWT(token)
            const role = payload.role

            if (role === 'admin') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url))
            } else if (role === 'owner') {
                return NextResponse.redirect(new URL('/dashboard/owner', request.url))
            } else {
                return NextResponse.redirect(new URL('/dashboard/user', request.url))
            }
        } catch (error) {
            // If token is invalid, clear it and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }
    }

    // For protected routes, verify role access and KYC status
    if (token && isProtectedRoute) {
        try {
            const payload = await verifyJWT(token)
            const userRole = payload.role
            const isKycVerified = payload.kycVerified

            // Check if user has required role for the route
            const requiredRoles = Object.entries(protectedRoutes).find(([route]) =>
                pathname === route || pathname.startsWith(`${route}/`)
            )?.[1]

            if (requiredRoles && !requiredRoles.includes(userRole)) {
                // Redirect to appropriate dashboard based on role
                if (userRole === 'admin') {
                    return NextResponse.redirect(new URL('/dashboard/admin', request.url))
                } else if (userRole === 'owner') {
                    return NextResponse.redirect(new URL('/dashboard/owner', request.url))
                } else {
                    return NextResponse.redirect(new URL('/dashboard/user', request.url))
                }
            }

            // Check KYC status for routes that require it
            if (requiresKYC && !isKycVerified && userRole === 'user') {
                return NextResponse.redirect(new URL('/profile?kyc_required=true', request.url))
            }
        } catch (error) {
            // If token is invalid, clear it and redirect to login
            const response = NextResponse.redirect(new URL('/login', request.url))
            response.cookies.delete('token')
            return response
        }
    }

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