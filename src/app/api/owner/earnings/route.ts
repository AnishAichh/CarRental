import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'

// GET /api/owner/earnings - get earnings for vehicles owned by current user
export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await verifyJWT(token)
    if (typeof decoded !== 'object' || !('id' in decoded)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }
    const owner_id = decoded.id
    const { rows } = await pool.query(
        `SELECT SUM(b.total_amount) as total_earnings
         FROM bookings b
         JOIN vehicles v ON b.vehicle_id = v.id
         WHERE v.owner_id = $1 AND b.status = 'confirmed'`,
        [owner_id]
    )
    return NextResponse.json({ earnings: rows[0].total_earnings || 0 })
} 