import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'

// GET /api/bookings/owner - get bookings for vehicles owned by current user
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            console.error('No token found in cookies')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token)
        if (typeof decoded !== 'object' || !('id' in decoded)) {
            console.error('Invalid token structure:', decoded)
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        const owner_id = decoded.id
        console.log('Fetching bookings for owner_id:', owner_id)

        // First check if the owner has any vehicles
        const vehiclesCheck = await pool.query(
            'SELECT id FROM vehicles WHERE owner_id = $1',
            [owner_id]
        )

        if (vehiclesCheck.rows.length === 0) {
            console.log('No vehicles found for owner_id:', owner_id)
            return NextResponse.json({
                bookings: [],
                message: 'No vehicles found for this owner'
            })
        }

        // Get bookings with vehicle and user details
        const query = `
            SELECT 
                b.id,
                b.vehicle_id,
                b.start_date,
                b.end_date,
                b.status,
                b.total_amount,
                b.created_at,
                v.name as vehicle_name,
                v.location as vehicle_location,
                u.name as user_name,
                u.email as user_email
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE v.owner_id = $1
            ORDER BY b.created_at DESC
        `

        console.log('Executing query for owner_id:', owner_id)
        const { rows } = await pool.query(query, [owner_id])
        console.log('Query returned rows:', rows.length)

        return NextResponse.json({
            bookings: rows,
            message: 'Bookings retrieved successfully'
        })

    } catch (error) {
        console.error('Detailed error in /api/bookings/owner:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })

        // Check if it's a database connection error
        if (error instanceof Error && error.message.includes('connect')) {
            return NextResponse.json({
                error: 'Database connection error',
                details: 'Unable to connect to the database'
            }, { status: 503 })
        }

        return NextResponse.json({
            error: 'Failed to fetch bookings',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 