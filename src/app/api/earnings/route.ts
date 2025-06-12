import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { NextResponse } from 'next/server'

const PLATFORM_CUT_PERCENT = 10 // Platform takes 10% from each booking

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
      SELECT 
        b.id, b.start_date, b.end_date,
        v.price_per_day,
        u.email AS user_email,
        (DATE_PART('day', b.end_date::timestamp - b.start_date::timestamp) + 1) AS days,
        ROUND((DATE_PART('day', b.end_date::timestamp - b.start_date::timestamp) + 1) * v.price_per_day) AS total_amount,
        ROUND(((DATE_PART('day', b.end_date::timestamp - b.start_date::timestamp) + 1) * v.price_per_day) * $1 / 100) AS platform_fee
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN vehicles v ON v.id = b.vehicle_id
    `, [PLATFORM_CUT_PERCENT])

    const total = rows.reduce((sum, b) => sum + Number(b.platform_fee), 0)

    return NextResponse.json({
      commission_percent: PLATFORM_CUT_PERCENT,
      total_earnings: total,
      records: rows
    })
  } catch (err) {
    return NextResponse.json({ error: 'Earnings calculation failed' }, { status: 500 })
  }
}