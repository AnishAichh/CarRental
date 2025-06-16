import { NextRequest, NextResponse } from 'next/server'
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
        if (!decoded || !decoded.id) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        // Verify admin status
        const { rows: adminRows } = await pool.query(
            'SELECT is_admin FROM users WHERE id = $1',
            [decoded.id]
        )

        if (adminRows.length === 0 || !adminRows[0].is_admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { action } = await request.json()
        if (!action || !['approve', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be either "approve" or "reject"' },
                { status: 400 }
            )
        }

        const requestId = parseInt(params.id)
        if (isNaN(requestId)) {
            return NextResponse.json(
                { error: 'Invalid request ID' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Update KYC request status
            const { rows: requestRows } = await client.query(
                `UPDATE kyc 
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING user_id`,
                [action === 'approve' ? 'approved' : 'rejected', requestId]
            )

            if (requestRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'KYC request not found' },
                    { status: 404 }
                )
            }

            // If approved, update the user's KYC verification status
            if (action === 'approve') {
                await client.query(
                    `UPDATE users 
                    SET is_kyc_verified = true, updated_at = NOW()
                    WHERE id = $1`,
                    [requestRows[0].user_id]
                )
            }

            await client.query('COMMIT')

            return NextResponse.json({
                message: `KYC request ${action}d successfully`
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error updating KYC request:', error)
            return NextResponse.json(
                { error: 'Failed to update KYC request' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in KYC request approval endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 