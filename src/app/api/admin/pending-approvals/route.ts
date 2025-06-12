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
            // Verify admin role
            const { rows: userRows } = await client.query(
                'SELECT role FROM users WHERE id = $1',
                [decoded.id]
            )

            if (userRows.length === 0 || userRows[0].role !== 'admin') {
                return NextResponse.json(
                    { error: 'Unauthorized - admin access required' },
                    { status: 403 }
                )
            }

            // Get pending KYC approvals
            const { rows: pendingKyc } = await client.query(
                `SELECT 
                    k.*,
                    u.name as user_name,
                    u.email as user_email,
                    u.phone as user_phone
                FROM kyc k
                JOIN users u ON k.user_id = u.id
                WHERE k.status = 'pending'
                ORDER BY k.created_at DESC`
            )

            // Get pending vehicle approvals
            const { rows: pendingVehicles } = await client.query(
                `SELECT 
                    v.*,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone
                FROM vehicles v
                JOIN users u ON v.owner_id = u.id
                WHERE v.status = 'pending_approval'
                ORDER BY v.created_at DESC`
            )

            // Get pending vehicle review requests
            const { rows: pendingReviews } = await client.query(
                `SELECT 
                    vr.*,
                    v.name as vehicle_name,
                    v.model as vehicle_model,
                    v.image_url as vehicle_image,
                    u.name as owner_name,
                    u.email as owner_email,
                    u.phone as owner_phone
                FROM vehicle_review_requests vr
                JOIN vehicles v ON vr.vehicle_id = v.id
                JOIN users u ON vr.owner_id = u.id
                WHERE vr.status = 'pending'
                ORDER BY vr.created_at DESC`
            )

            return NextResponse.json({
                pending_kyc: pendingKyc,
                pending_vehicles: pendingVehicles,
                pending_reviews: pendingReviews
            })
        } catch (error) {
            console.error('Error fetching pending approvals:', error)
            return NextResponse.json(
                { error: 'Failed to fetch pending approvals' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in pending approvals endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 