import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'

export async function GET(req: NextRequest) {
    try {
        const token = req.cookies.get('token')?.value

        if (!token) {
            return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 })
        }

        const payload = await verifyJWT(token)

        return NextResponse.json({ user: payload }, { status: 200 })
    } catch (error: any) {
        console.error('Error in /api/auth/me:', error)
        return NextResponse.json({ message: 'Unauthorized: Invalid token', error: error.message }, { status: 401 })
    }
}