import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    const url = request.nextUrl;
    const id = url.pathname.split("/").reverse()[1]; // Extracts the [id] param
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const { action } = await request.json()
        if (!action || !['confirm', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be either "confirm" or "reject"' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Verify booking ownership
            const { rows: bookingRows } = await client.query(
                `SELECT b.*, v.owner_id 
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE b.id = $1`,
                [id]
            )

            if (bookingRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
            }

            const booking = bookingRows[0]
            if (booking.owner_id !== decoded.id) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Unauthorized - not the vehicle owner' },
                    { status: 403 }
                )
            }

            if (booking.status !== 'pending') {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Booking is not in pending status' },
                    { status: 400 }
                )
            }

            // Update booking status
            await client.query(
                'UPDATE bookings SET status = $1 WHERE id = $2',
                [action === 'confirm' ? 'confirmed' : 'rejected', id]
            )

            // If rejected, check if there are other pending bookings for the same dates
            if (action === 'reject') {
                const { rows: overlappingBookings } = await client.query(
                    `SELECT id FROM bookings 
                    WHERE vehicle_id = $1 
                    AND status = 'pending'
                    AND (
                        (start_date <= $2 AND end_date >= $2)
                        OR (start_date <= $3 AND end_date >= $3)
                        OR (start_date >= $2 AND end_date <= $3)
                    )`,
                    [booking.vehicle_id, booking.start_date, booking.end_date]
                )

                // If no other pending bookings, set vehicle as available
                if (overlappingBookings.length === 0) {
                    await client.query(
                        'UPDATE vehicles SET availability = true WHERE id = $1',
                        [booking.vehicle_id]
                    )
                }
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: `Booking ${action === 'confirm' ? 'confirmed' : 'rejected'} successfully`
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error in booking management:', error)
            return NextResponse.json(
                { error: 'Failed to process booking request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in booking management:', error)
        return NextResponse.json(
            { error: 'Failed to process booking request' },
            { status: 500 }
        )
    }
} 