import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { JwtPayload } from 'jsonwebtoken'

export async function GET() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const decoded = verifyJWT(token)
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

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyJWT(token) as JwtPayload
    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { vehicle_id, start_date, end_date } = body

    if (!vehicle_id || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Check user's KYC status
      const { rows: userRows } = await client.query(
        'SELECT is_kyc_verified FROM users WHERE id = $1',
        [decoded.id]
      )

      if (userRows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      if (!userRows[0].is_kyc_verified) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'KYC verification required to make bookings' },
          { status: 403 }
        )
      }

      // Check vehicle availability
      const { rows: vehicleRows } = await client.query(
        `SELECT 
                    v.*,
                    u.name as owner_name,
                    u.email as owner_email
                FROM vehicles v
                JOIN users u ON v.owner_id = u.id
                WHERE v.id = $1 
                AND v.approved_by_admin = true 
                AND v.availability = true`,
        [vehicle_id]
      )

      if (vehicleRows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'Vehicle not available for booking' },
          { status: 400 }
        )
      }

      const vehicle = vehicleRows[0]

      // Check for overlapping bookings
      const { rows: overlappingBookings } = await client.query(
        `SELECT id FROM bookings 
                WHERE vehicle_id = $1 
                AND status IN ('pending', 'confirmed')
                AND (
                    (start_date <= $2 AND end_date >= $2)
                    OR (start_date <= $3 AND end_date >= $3)
                    OR (start_date >= $2 AND end_date <= $3)
                )`,
        [vehicle_id, start_date, end_date]
      )

      if (overlappingBookings.length > 0) {
        await client.query('ROLLBACK')
        return NextResponse.json(
          { error: 'Vehicle is already booked for the selected dates' },
          { status: 400 }
        )
      }

      // Calculate total amount
      const start = new Date(start_date)
      const end = new Date(end_date)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const total_amount = days * vehicle.price_per_day

      // Create booking
      const { rows: booking } = await client.query(
        `INSERT INTO bookings (
                    vehicle_id, user_id, start_date, end_date,
                    status, total_amount
                ) VALUES ($1, $2, $3, $4, 'pending', $5)
                RETURNING *`,
        [vehicle_id, decoded.id, start_date, end_date, total_amount]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        message: 'Booking request submitted successfully',
        booking: booking[0]
      }, { status: 201 })
    } catch (error) {
      await client.query('ROLLBACK')
      console.error('Error creating booking:', error)
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      )
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in booking endpoint:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}