import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'

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
        const { fullName, drivingLicenseUrl, addressProofUrl, ownershipDeclaration } = body

        // Validate required fields
        if (!fullName || !drivingLicenseUrl || !addressProofUrl || !ownershipDeclaration) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Check if user already has a pending request
            const { rows: existingRequests } = await client.query(
                `SELECT id FROM owner_requests 
                WHERE user_id = $1 AND status = 'pending'`,
                [decoded.id]
            )

            if (existingRequests.length > 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'You already have a pending owner request' },
                    { status: 400 }
                )
            }

            // Check if user is already an owner
            const { rows: userRows } = await client.query(
                'SELECT role FROM users WHERE id = $1',
                [decoded.id]
            )

            if (userRows[0].role === 'owner') {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'You are already an owner' },
                    { status: 400 }
                )
            }

            // Create owner request
            const { rows: request } = await client.query(
                `INSERT INTO owner_requests (
                    user_id, full_name, driving_license_url,
                    address_proof_url, ownership_declaration
                ) VALUES ($1, $2, $3, $4, $5)
                RETURNING *`,
                [decoded.id, fullName, drivingLicenseUrl, addressProofUrl, ownershipDeclaration]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Owner request submitted successfully',
                request: request[0]
            }, { status: 201 })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error creating owner request:', error)
            return NextResponse.json(
                { error: 'Failed to submit owner request' },
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
            // Get user's owner request status
            const { rows: requests } = await client.query(
                `SELECT * FROM owner_requests 
                WHERE user_id = $1 
                ORDER BY created_at DESC 
                LIMIT 1`,
                [decoded.id]
            )

            return NextResponse.json({
                request: requests[0] || null
            })
        } catch (error) {
            console.error('Error fetching owner request:', error)
            return NextResponse.json(
                { error: 'Failed to fetch owner request' },
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