import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function PUT(request: NextRequest, context: any) {
    const params = await context.params;
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
            image_url,
            availability
        } = body

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Verify vehicle ownership
            const { rows: vehicleRows } = await client.query(
                'SELECT * FROM vehicles WHERE id = $1 AND owner_id = $2',
                [params.id, decoded.id]
            )

            if (vehicleRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Vehicle not found or unauthorized' },
                    { status: 404 }
                )
            }

            // Update vehicle details
            const { rows: updatedVehicle } = await client.query(
                `UPDATE vehicles 
                SET 
                    name = COALESCE($1, name),
                    model = COALESCE($2, model),
                    year = COALESCE($3, year),
                    price_per_day = COALESCE($4, price_per_day),
                    description = COALESCE($5, description),
                    image_url = COALESCE($6, image_url),
                    availability = COALESCE($7, availability),
                    updated_at = NOW()
                WHERE id = $8 AND owner_id = $9
                RETURNING *`,
                [
                    name,
                    model,
                    year,
                    price_per_day,
                    description,
                    image_url,
                    availability,
                    params.id,
                    decoded.id
                ]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Vehicle updated successfully',
                vehicle: updatedVehicle[0]
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error updating vehicle:', error)
            return NextResponse.json(
                { error: 'Failed to update vehicle' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicle update:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest, context: any) {
    const params = await context.params;
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
            await client.query('BEGIN')

            // Check for active bookings
            const { rows: activeBookings } = await client.query(
                `SELECT id FROM bookings 
                WHERE vehicle_id = $1 
                AND status IN ('pending', 'confirmed')
                AND end_date >= CURRENT_DATE`,
                [params.id]
            )

            if (activeBookings.length > 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Cannot delete vehicle with active bookings' },
                    { status: 400 }
                )
            }

            // Delete vehicle
            const { rows: deletedVehicle } = await client.query(
                'DELETE FROM vehicles WHERE id = $1 AND owner_id = $2 RETURNING *',
                [params.id, decoded.id]
            )

            if (deletedVehicle.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Vehicle not found or unauthorized' },
                    { status: 404 }
                )
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Vehicle deleted successfully',
                vehicle: deletedVehicle[0]
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error deleting vehicle:', error)
            return NextResponse.json(
                { error: 'Failed to delete vehicle' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicle deletion:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 