import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const decoded = await verifyJWT(token)
  if (typeof decoded !== 'object' || !('id' in decoded)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM bookings WHERE user_id = $1 ORDER BY start_date DESC',
      [decoded.id]
    )
    return NextResponse.json(rows)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (!decoded || !decoded.id) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 403 })
    }

    const { vehicle_id, start_date, end_date, total_amount, booking_option } = await req.json()

    if (!vehicle_id || !start_date || !end_date || !total_amount || !booking_option) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 })
    }

    const result = await pool.query(
      `
      INSERT INTO bookings (
        user_id,
        vehicle_id,
        start_date,
        end_date,
        total_amount,
        status,
        booking_option
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        'pending',
        $6
      ) RETURNING id;
      `,
      [decoded.id, vehicle_id, start_date, end_date, total_amount, booking_option]
    )

    return NextResponse.json({ message: 'Booking created successfully', bookingId: result.rows[0].id }, { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}