import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Verify if user is admin
        const { rows: adminRows } = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND role = $2',
            [decoded.id, 'admin']
        )

        if (adminRows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const vehicleId = params.id

        // Update vehicle status to rejected
        const { rows } = await pool.query(
            `UPDATE vehicles 
       SET status = 'rejected', is_available = false
       WHERE id = $1
       RETURNING *`,
            [vehicleId]
        )

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Vehicle not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({ message: 'Vehicle rejected successfully' })
    } catch (error) {
        console.error('Error rejecting vehicle:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 