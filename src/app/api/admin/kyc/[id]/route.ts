import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    const url = request.nextUrl
    const id = url.pathname.split("/").reverse()[2] // Extracts the [id] param
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        await pool.query(`UPDATE users SET is_kyc_verified = true WHERE id = $1`, [id])
        await pool.query(`UPDATE kyc SET status = 'approved' WHERE user_id = $1`, [id])
        return NextResponse.json({ success: true, message: 'KYC approved' })
    } catch (err) {
        console.error('Error approving KYC:', err)
        return NextResponse.json({ error: 'Failed to approve KYC' }, { status: 500 })
    }
}