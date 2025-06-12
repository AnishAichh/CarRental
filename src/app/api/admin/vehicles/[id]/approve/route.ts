import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(
    request: NextRequest,
    context: { params: { id: string } }
) {
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
        const { action, notes } = body

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be either "approve" or "reject"' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Check if user is admin
            const { rows: adminRows } = await client.query(
                'SELECT is_admin FROM users WHERE id = $1',
                [decoded.id]
            )

            if (adminRows.length === 0 || !adminRows[0].is_admin) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Unauthorized. Admin access required.' },
                    { status: 403 }
                )
            }

            // Get vehicle and check if it exists and is in a state that can be approved/rejected
            const { rows: vehicleRows } = await client.query(
                `SELECT v.*, vr.id as review_request_id, vr.status as review_status
                FROM vehicles v
                LEFT JOIN vehicle_review_requests vr ON v.id = vr.vehicle_id
                WHERE v.id = $1 AND (
                    v.status = 'pending_approval'
                    OR (vr.id IS NOT NULL AND vr.status = 'pending')
                )`,
                [context.params.id]
            )

            if (vehicleRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Vehicle or pending review request not found' },
                    { status: 404 }
                )
            }

            const vehicle = vehicleRows[0]

            // Update vehicle status based on action
            if (action === 'approve') {
                await client.query(
                    `UPDATE vehicles 
                    SET status = 'approved', 
                        approved = true,
                        approved_by_admin = true,
                        availability = true
                    WHERE id = $1`,
                    [vehicle.id]
                )

                // If there's a review request, update it too
                if (vehicle.review_request_id) {
                    await client.query(
                        `UPDATE vehicle_review_requests 
                        SET status = 'approved',
                            review_notes = $1,
                            review_date = NOW()
                        WHERE id = $2`,
                        [notes || 'Approved by admin', vehicle.review_request_id]
                    )
                }
            } else {
                await client.query(
                    `UPDATE vehicles 
                    SET status = 'rejected', 
                        approved = false,
                        approved_by_admin = false
                    WHERE id = $1`,
                    [vehicle.id]
                )

                // If there's a review request, update it too
                if (vehicle.review_request_id) {
                    await client.query(
                        `UPDATE vehicle_review_requests 
                        SET status = 'rejected',
                            review_notes = $1,
                            review_date = NOW()
                        WHERE id = $2`,
                        [notes || 'Rejected by admin', vehicle.review_request_id]
                    )
                }
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: `Vehicle ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
                vehicle: {
                    ...vehicle,
                    status: action === 'approve' ? 'approved' : 'rejected',
                    approved: action === 'approve',
                    approved_by_admin: action === 'approve',
                    availability: action === 'approve'
                }
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error in vehicle approval:', error)
            return NextResponse.json(
                { error: 'Failed to process vehicle approval' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicle approval endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 