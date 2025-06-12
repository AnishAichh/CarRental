import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyJWT(token)
    if (typeof decoded !== 'object' || decoded.is_admin !== true) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { rows } = await pool.query(`
            SELECT 
                b.id AS booking_id,
                u.email AS user_email,
                v.name AS vehicle_name,
                b.start_date,
                b.end_date,
                v.price_per_day,
                (DATE_PART('day', b.end_date::timestamp - b.start_date::timestamp) + 1) AS days,
                ROUND((DATE_PART('day', b.end_date::timestamp - b.start_date::timestamp) + 1) * v.price_per_day) AS total_amount
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN vehicles v ON v.id = b.vehicle_id
            ORDER BY b.start_date DESC
        `)

        const formatted = rows.map(row => ({
            id: row.booking_id,
            vehicle_name: row.vehicle_name,
            renter_email: row.user_email,
            start_date: row.start_date,
            end_date: row.end_date,
            total_price: row.total_amount,
            platform_fee: Math.round(row.total_amount * 0.1), // or your logic
            status: 'Confirmed' // update if you have a real status field
        }))

        return NextResponse.json(formatted)
    } catch (err) {
        console.error('Admin Bookings Error:', err)
        return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
    }
}