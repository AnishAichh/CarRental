import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

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
        const {
            name,
            model,
            year,
            price_per_day,
            description,
            image_url
        } = body

        // Validate required fields
        if (!name || !model || !year || !price_per_day || !description) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Insert new vehicle
            const { rows: newVehicle } = await client.query(
                `INSERT INTO vehicles (
                    name,
                    model,
                    year,
                    price_per_day,
                    description,
                    image_url,
                    owner_id,
                    availability,
                    approved,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, true, false, NOW(), NOW())
                RETURNING *`,
                [
                    name,
                    model,
                    year,
                    price_per_day,
                    description,
                    image_url,
                    decoded.id
                ]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Vehicle added successfully and pending approval',
                vehicle: newVehicle[0]
            }, { status: 201 })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error adding vehicle:', error)
            return NextResponse.json(
                { error: 'Failed to add vehicle' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicle creation:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const client = await pool.connect()
        try {
            // Get all vehicles owned by the user with booking statistics
            const { rows: vehicles } = await client.query(
                `SELECT 
                    v.*,
                    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed') as total_bookings,
                    COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending') as pending_bookings,
                    COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'completed'), 0) as total_revenue
                FROM vehicles v
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1
                GROUP BY v.id
                ORDER BY v.created_at DESC`,
                [decoded.id]
            )

            return NextResponse.json({ vehicles })
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            return NextResponse.json(
                { error: 'Failed to fetch vehicles' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicles endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 