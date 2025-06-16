import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

// GET /api/vehicles/availability - check if a vehicle is available for a date range
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const vehicle_id = searchParams.get('vehicle_id')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')
    if (!vehicle_id || !start_date || !end_date) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const { rows } = await pool.query(
        `SELECT * FROM bookings WHERE vehicle_id = $1 AND status IN ('confirmed','pending')
         AND NOT (end_date < $2 OR start_date > $3)`,
        [vehicle_id, start_date, end_date]
    )
    return NextResponse.json({ available: rows.length === 0 })
} 