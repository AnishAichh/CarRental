import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Verify if user is admin
        const { rows: adminRows } = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND role = $2',
            [decoded.id, 'admin']
        )

        if (adminRows.length === 0) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const requestId = params.id
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

            // Get the owner request
            const { rows: requestRows } = await client.query(
                'SELECT * FROM owner_requests WHERE id = $1',
                [requestId]
            )

            if (requestRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'Owner request not found' },
                    { status: 404 }
                )
            }

            const ownerRequest = requestRows[0]

            // Update owner request status
            await client.query(
                `UPDATE owner_requests 
                SET status = $1, 
                    admin_notes = $2,
                    reviewed_at = NOW()
                WHERE id = $3`,
                [action, notes || `${action === 'approve' ? 'Approved' : 'Rejected'} by admin`, requestId]
            )

            if (action === 'approve') {
                // Update user role to owner
                await client.query(
                    'UPDATE users SET role = $1 WHERE id = $2',
                    ['owner', ownerRequest.user_id]
                )

                // If there's a vehicle associated with this request, set it to pending
                if (ownerRequest.vehicle_id) {
                    await client.query(
                        `UPDATE vehicles 
                        SET status = 'pending', 
                            is_available = false
                        WHERE id = $1`,
                        [ownerRequest.vehicle_id]
                    )
                }
            } else {
                // If rejected, ensure any associated vehicle is also rejected
                if (ownerRequest.vehicle_id) {
                    await client.query(
                        `UPDATE vehicles 
                        SET status = 'rejected', 
                            is_available = false
                        WHERE id = $1`,
                        [ownerRequest.vehicle_id]
                    )
                }
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: `Owner request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error in owner request approval:', error)
            return NextResponse.json(
                { error: 'Failed to process owner request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in owner request approval endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 