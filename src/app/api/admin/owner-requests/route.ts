import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id || !decoded.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const client = await pool.connect()
        try {
            // Get all owner requests with user details
            const { rows: requests } = await client.query(
                `SELECT 
                    r.*,
                    u.email as user_email,
                    u.name as user_name
                FROM owner_requests r
                JOIN users u ON r.user_id = u.id
                ORDER BY r.created_at DESC`
            )

            return NextResponse.json({ requests })
        } catch (error) {
            console.error('Error fetching owner requests:', error)
            return NextResponse.json(
                { error: 'Failed to fetch owner requests' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in owner requests endpoint:', error)
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
        if (!decoded || !decoded.id || !decoded.is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { requestId, action, adminNotes } = body

        if (!requestId || !action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid request parameters' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Get the owner request
            const { rows: requests } = await client.query(
                'SELECT * FROM owner_requests WHERE id = $1',
                [requestId]
            )

            if (requests.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Owner request not found' },
                    { status: 404 }
                )
            }

            const ownerRequest = requests[0]

            if (ownerRequest.status !== 'pending') {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'This request has already been processed' },
                    { status: 400 }
                )
            }

            // Update owner request status
            await client.query(
                `UPDATE owner_requests 
                SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3`,
                [action === 'approve' ? 'approved' : 'rejected', adminNotes, requestId]
            )

            // If approved, update user role
            if (action === 'approve') {
                await client.query(
                    'UPDATE users SET role = $1 WHERE id = $2',
                    ['owner', ownerRequest.user_id]
                )
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: `Owner request ${action}d successfully`
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error processing owner request:', error)
            return NextResponse.json(
                { error: 'Failed to process owner request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in owner requests endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 