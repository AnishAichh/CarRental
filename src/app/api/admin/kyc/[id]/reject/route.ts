import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function POST(request: NextRequest) {
    const url = request.nextUrl;
    const id = url.pathname.split("/").reverse()[2]; // Extracts the [id] param

    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token)
        if (!decoded || typeof decoded !== 'object' || !decoded.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await pool.query(
            'UPDATE kyc SET status = $1 WHERE id = $2',
            ['rejected', id]
        )

        return NextResponse.json({ message: 'KYC rejected successfully' }, { status: 200 })

    } catch (error) {
        console.error('Error rejecting KYC:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}