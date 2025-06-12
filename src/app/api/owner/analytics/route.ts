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
            // Get overall statistics
            const { rows: overallStats } = await client.query(
                `SELECT 
                    COUNT(DISTINCT v.id) as total_vehicles,
                    COUNT(DISTINCT CASE WHEN v.approved = true THEN v.id END) as approved_vehicles,
                    COUNT(DISTINCT CASE WHEN v.availability = true THEN v.id END) as available_vehicles,
                    COUNT(DISTINCT b.id) as total_bookings,
                    COUNT(DISTINCT CASE WHEN b.status = 'completed' THEN b.id END) as completed_bookings,
                    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
                    COALESCE(AVG(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE NULL END), 0) as average_booking_value
                FROM vehicles v
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1`,
                [decoded.id]
            )

            // Get monthly revenue for the last 12 months
            const { rows: monthlyRevenue } = await client.query(
                `SELECT 
                    DATE_TRUNC('month', b.created_at) as month,
                    COUNT(DISTINCT b.id) as booking_count,
                    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) as revenue
                FROM vehicles v
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1
                AND b.created_at >= NOW() - INTERVAL '12 months'
                GROUP BY DATE_TRUNC('month', b.created_at)
                ORDER BY month DESC`,
                [decoded.id]
            )

            // Get top performing vehicles
            const { rows: topVehicles } = await client.query(
                `SELECT 
                    v.id,
                    v.name,
                    v.model,
                    v.image_url,
                    COUNT(DISTINCT b.id) as booking_count,
                    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) as revenue
                FROM vehicles v
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1
                GROUP BY v.id, v.name, v.model, v.image_url
                ORDER BY revenue DESC
                LIMIT 5`,
                [decoded.id]
            )

            // Get booking status distribution
            const { rows: bookingStatus } = await client.query(
                `SELECT 
                    b.status,
                    COUNT(*) as count
                FROM vehicles v
                JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1
                GROUP BY b.status`,
                [decoded.id]
            )

            return NextResponse.json({
                overall: overallStats[0],
                monthly_revenue: monthlyRevenue,
                top_vehicles: topVehicles,
                booking_status: bookingStatus
            })
        } catch (error) {
            console.error('Error fetching analytics:', error)
            return NextResponse.json(
                { error: 'Failed to fetch analytics' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in analytics endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 