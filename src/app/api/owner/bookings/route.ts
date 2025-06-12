import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

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
            // Get all bookings for vehicles owned by the user
            const { rows: bookings } = await client.query(
                `SELECT 
                    b.*,
                    v.name as vehicle_name,
                    v.model as vehicle_model,
                    v.image_url as vehicle_image,
                    u.name as renter_name,
                    u.email as renter_email
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                JOIN users u ON b.user_id = u.id
                WHERE v.owner_id = $1
                ORDER BY b.created_at DESC`,
                [decoded.id]
            )

            // Get booking statistics
            const { rows: stats } = await client.query(
                `SELECT 
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                    COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed_count
                FROM bookings b
                JOIN vehicles v ON b.vehicle_id = v.id
                WHERE v.owner_id = $1`,
                [decoded.id]
            )

            return NextResponse.json({
                bookings,
                statistics: stats[0]
            })
        } catch (error) {
            console.error('Error fetching bookings:', error)
            return NextResponse.json(
                { error: 'Failed to fetch bookings' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in bookings endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 