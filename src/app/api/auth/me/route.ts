import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return NextResponse.json({ error: 'No token' }, { status: 401 })
        }

        const decoded = verifyJWT(token)

        if (typeof decoded !== 'object' || !('id' in decoded)) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        // Get user data with latest KYC status
        const { rows } = await pool.query(
            `SELECT 
                u.id, 
                u.email, 
                u.is_admin,
                u.is_kyc_verified,
                k.status as kyc_status,
                k.created_at as kyc_created_at
            FROM users u
            LEFT JOIN kyc k ON u.id = k.user_id
            WHERE u.id = $1
            ORDER BY k.created_at DESC
            LIMIT 1`,
            [decoded.id]
        )

        if (rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        return NextResponse.json(rows[0])
    } catch (err) {
        console.error('❌ Error in /api/auth/me:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}