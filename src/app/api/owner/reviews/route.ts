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
            // Get all review requests for owner's vehicles
            const { rows: reviewRequests } = await client.query(
                `SELECT 
                    vr.*,
                    v.name as vehicle_name,
                    v.model as vehicle_model,
                    v.image_url as vehicle_image,
                    u.name as reviewer_name,
                    u.email as reviewer_email,
                    b.start_date,
                    b.end_date
                FROM vehicle_review_requests vr
                JOIN vehicles v ON vr.vehicle_id = v.id
                JOIN users u ON vr.user_id = u.id
                LEFT JOIN bookings b ON vr.booking_id = b.id
                WHERE v.owner_id = $1
                ORDER BY vr.created_at DESC`,
                [decoded.id]
            )

            // Get review statistics
            const { rows: reviewStats } = await client.query(
                `SELECT 
                    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
                    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
                    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
                    COALESCE(AVG(rating) FILTER (WHERE status = 'approved'), 0) as average_rating
                FROM vehicle_review_requests vr
                JOIN vehicles v ON vr.vehicle_id = v.id
                WHERE v.owner_id = $1`,
                [decoded.id]
            )

            return NextResponse.json({
                review_requests: reviewRequests,
                statistics: reviewStats[0]
            })
        } catch (error) {
            console.error('Error fetching review requests:', error)
            return NextResponse.json(
                { error: 'Failed to fetch review requests' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in review requests endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

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
        const { review_request_id, action, response_message } = body

        if (!review_request_id || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Verify review request ownership
            const { rows: reviewRows } = await client.query(
                `SELECT vr.* 
                FROM vehicle_review_requests vr
                JOIN vehicles v ON vr.vehicle_id = v.id
                WHERE vr.id = $1 AND v.owner_id = $2`,
                [review_request_id, decoded.id]
            )

            if (reviewRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Review request not found or unauthorized' },
                    { status: 404 }
                )
            }

            const reviewRequest = reviewRows[0]
            if (reviewRequest.status !== 'pending') {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Review request is not in pending status' },
                    { status: 400 }
                )
            }

            // Update review request status
            const { rows: updatedReview } = await client.query(
                `UPDATE vehicle_review_requests 
                SET 
                    status = $1,
                    response_message = $2,
                    updated_at = NOW()
                WHERE id = $3
                RETURNING *`,
                [action === 'approve' ? 'approved' : 'rejected', response_message, review_request_id]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: `Review request ${action}ed successfully`,
                review_request: updatedReview[0]
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error processing review request:', error)
            return NextResponse.json(
                { error: 'Failed to process review request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in review request processing:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 