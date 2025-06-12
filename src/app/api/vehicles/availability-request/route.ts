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
        const { vehicle_id, notes } = body

        if (!vehicle_id) {
            return NextResponse.json(
                { error: 'Vehicle ID is required' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Verify vehicle ownership
            const { rows: vehicleRows } = await client.query(
                `SELECT id, status, availability 
                FROM vehicles 
                WHERE id = $1 AND owner_id = $2`,
                [vehicle_id, decoded.id]
            )

            if (vehicleRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Vehicle not found or unauthorized' },
                    { status: 404 }
                )
            }

            const vehicle = vehicleRows[0]

            // Check if vehicle is already available
            if (vehicle.availability) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Vehicle is already available' },
                    { status: 400 }
                )
            }

            // Check if there's already a pending review request
            const { rows: existingRequest } = await client.query(
                `SELECT id FROM vehicle_review_requests 
                WHERE vehicle_id = $1 AND status = 'pending'`,
                [vehicle_id]
            )

            if (existingRequest.length > 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'A review request is already pending for this vehicle' },
                    { status: 400 }
                )
            }

            // Create review request
            const { rows: reviewRequest } = await client.query(
                `INSERT INTO vehicle_review_requests (
                    vehicle_id, owner_id, status, review_notes
                ) VALUES ($1, $2, 'pending', $3)
                RETURNING *`,
                [vehicle_id, decoded.id, notes]
            )

            // Update vehicle status
            await client.query(
                `UPDATE vehicles 
                SET status = 'pending_physical_verification'
                WHERE id = $1`,
                [vehicle_id]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Availability reactivation request submitted successfully',
                review_request: reviewRequest[0]
            }, { status: 201 })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error creating availability request:', error)
            return NextResponse.json(
                { error: 'Failed to create availability request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in availability request:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 