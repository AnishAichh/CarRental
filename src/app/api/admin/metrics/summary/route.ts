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
        const [users, vehicles, bookings, kyc] = await Promise.all([
            pool.query('SELECT COUNT(*) FROM users'),
            pool.query('SELECT COUNT(*) FROM vehicles'),
            pool.query('SELECT COUNT(*) FROM bookings'),
            pool.query(`SELECT COUNT(*) FROM kyc WHERE status = 'pending'`)
        ])

        return NextResponse.json({
            total_users: parseInt(users.rows[0].count),
            total_vehicles: parseInt(vehicles.rows[0].count),
            total_bookings: parseInt(bookings.rows[0].count),
            pending_kyc: parseInt(kyc.rows[0].count)
        })
    } catch {
        return NextResponse.json({ error: 'Failed to load metrics' }, { status: 500 })
    }
}