import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    const url = request.nextUrl;
    const id = url.pathname.split("/").reverse()[2]; // Extracts the [id] param
    try {
        // Verify admin token
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

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Get KYC record
            const { rows: kycRows } = await client.query(
                'SELECT user_id FROM kyc WHERE id = $1',
                [id]
            )

            if (kycRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json({ error: 'KYC record not found' }, { status: 404 })
            }

            const userId = kycRows[0].user_id

            // Update KYC status
            await client.query(
                'UPDATE kyc SET status = $1 WHERE id = $2',
                ['approved', id]
            )

            // Update user's KYC verification status
            await client.query(
                'UPDATE users SET is_kyc_verified = true WHERE id = $1',
                [userId]
            )

            await client.query('COMMIT')
            return NextResponse.json({ message: 'KYC approved successfully' })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error in KYC approval:', error)
            return NextResponse.json(
                { error: 'Failed to approve KYC' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in KYC approval:', error)
        return NextResponse.json(
            { error: 'Failed to approve KYC' },
            { status: 500 }
        )
    }
}
