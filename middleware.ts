import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from './src/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

const publicPaths = ['/', '/login', '/register', '/kyc']

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('token')?.value || ''
    const path = req.nextUrl.pathname

    if (publicPaths.some(p => path.startsWith(p))) {
        return NextResponse.next()
    }

    try {
        const decoded = await verifyJWT(token)

        // Type check and narrow
        if (!decoded || typeof decoded === 'string' || !(decoded as JwtPayload).id) {
            return NextResponse.redirect(new URL('/login', req.url))
        }

        const user = decoded as JwtPayload

        // 1. Admin routes check
        if (path.startsWith('/admin') && !user.isAdmin) {
            return NextResponse.redirect(new URL('/', req.url))
        }

        // 2. Booking routes require KYC
        if (path.startsWith('/vehicles') || path.startsWith('/bookings')) {
            const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/auth/me`, {
                headers: { Cookie: `token=${token}` }
            })
            const userData = await res.json()

            if (userData.kyc_status !== 'approved') {
                return NextResponse.redirect(new URL('/kyc', req.url))
            }
        }

        return NextResponse.next()
    } catch {
        return NextResponse.redirect(new URL('/login', req.url))
    }
}

export const config = {
    matcher: [
        '/vehicles/:path*',
        '/bookings',
        '/earnings',
        '/admin/:path*'
    ]
}
