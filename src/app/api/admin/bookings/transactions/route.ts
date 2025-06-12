import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyJWT(token)
    if (typeof decoded !== 'object' || decoded.is_admin !== true) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { rows } = await pool.query(`
      SELECT b.*, u.email, v.name AS vehicle_name
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
      ORDER BY b.created_at DESC
    `)

        return NextResponse.json(rows)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
}