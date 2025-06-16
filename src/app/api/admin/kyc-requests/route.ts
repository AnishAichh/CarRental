import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Verify admin status
        const { rows: adminRows } = await pool.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [decoded.id]
        )

        if (adminRows.length === 0 || !adminRows[0].is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const result = await pool.query(`
            SELECT 
                k.*,
                u.name as user_name,
                u.email as user_email
            FROM kyc k
            LEFT JOIN users u ON k.user_id = u.id
            ORDER BY k.created_at DESC
        `)

        const requests = result.rows.map(row => ({
            ...row,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email
            }
        }))

        return NextResponse.json({ requests })
    } catch (error) {
        console.error('Error fetching KYC requests:', error)
        return NextResponse.json(
            { error: 'Failed to fetch KYC requests' },
            { status: 500 }
        )
    }
} 