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

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = params
        const requestId = parseInt(id)
        if (isNaN(requestId)) {
            return NextResponse.json({ error: 'Invalid request ID' }, { status: 400 })
        }

        const body = await request.json()
        const { action, admin_notes } = body

        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Get the owner request
            const { rows: ownerRequestRows } = await client.query(
                `SELECT * FROM owner_requests WHERE id = $1`,
                [requestId]
            )

            if (ownerRequestRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json({ error: 'Owner request not found' }, { status: 404 })
            }

            const ownerRequest = ownerRequestRows[0]

            // Update owner request status
            await client.query(
                `UPDATE owner_requests 
                SET status = $1, admin_notes = $2, updated_at = NOW()
                WHERE id = $3`,
                [action === 'approve' ? 'approved' : 'rejected', admin_notes, requestId]
            )

            if (action === 'approve') {
                if (ownerRequest.request_type === 'owner_application') {
                    // Update user role to owner only for owner applications
                    await client.query(
                        `UPDATE users 
                    SET role = 'owner' 
                    WHERE id = $1`,
                        [ownerRequest.user_id]
                    )
                    // No vehicle creation here, as vehicles are submitted separately now
                } else if (ownerRequest.request_type === 'vehicle_submission') {
                    // Update vehicle status for vehicle submissions
                    if (ownerRequest.vehicle_id) {
                        await client.query(
                            `UPDATE vehicles 
                            SET status = 'approved', is_available = true, approved_by_admin = true, updated_at = NOW()
                            WHERE id = $1`,
                            [ownerRequest.vehicle_id]
                        )
                    }
                }
            } else if (action === 'reject') {
                if (ownerRequest.request_type === 'vehicle_submission') {
                    // Update vehicle status for rejected vehicle submissions
                    if (ownerRequest.vehicle_id) {
                        await client.query(
                            `UPDATE vehicles 
                            SET status = 'rejected', is_available = false, approved_by_admin = false, updated_at = NOW()
                            WHERE id = $1`,
                            [ownerRequest.vehicle_id]
                        )
                    }
                }
            }

            await client.query('COMMIT')
            return NextResponse.json({
                message: `Request ${action}ed successfully`,
                request: { ...ownerRequest, status: action === 'approve' ? 'approved' : 'rejected', admin_notes }
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
        console.error('Error in owner request endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 