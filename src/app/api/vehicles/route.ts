import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const client = await pool.connect()
        try {
            // Get all approved and available vehicles
            const { rows: vehicles } = await client.query(
                `SELECT 
                    v.*,
                    u.name as owner_name,
                    u.email as owner_email
                FROM vehicles v
                JOIN users u ON v.owner_id = u.id
                WHERE v.approved_by_admin = true 
                AND v.availability = true
                ORDER BY v.created_at DESC`
            )

            return NextResponse.json({ vehicles })
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            return NextResponse.json(
                { error: 'Failed to fetch vehicles' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicles endpoint:', error)
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
        const {
            name,
            brand,
            type,
            price_per_day,
            image_url
        } = body

        // Validate required fields
        if (!name || !brand || !type || !price_per_day) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Check if user is KYC verified
            const { rows: userRows } = await client.query(
                `SELECT u.*, k.status as kyc_status 
                FROM users u
                LEFT JOIN kyc k ON u.id = k.user_id
                WHERE u.id = $1
                ORDER BY k.created_at DESC
                LIMIT 1`,
                [decoded.id]
            )

            if (userRows.length === 0) {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }

            if (!userRows[0].kyc_status || userRows[0].kyc_status !== 'approved') {
                await client.query('ROLLBACK')
                return NextResponse.json(
                    { error: 'KYC verification required to list vehicles' },
                    { status: 403 }
                )
            }

            // Insert vehicle
            const { rows: vehicle } = await client.query(
                `INSERT INTO vehicles (
                    name, brand, type, price_per_day, 
                    image_url, owner_id, status, availability, approved
                ) VALUES ($1, $2, $3, $4, $5, $6, 'pending_approval', false, false)
                RETURNING *`,
                [name, brand, type, price_per_day, image_url, decoded.id]
            )

            // Create review request
            await client.query(
                `INSERT INTO vehicle_review_requests (
                    vehicle_id, owner_id, status
                ) VALUES ($1, $2, 'pending')`,
                [vehicle[0].id, decoded.id]
            )

            // Update user role to owner if not already
            await client.query(
                `UPDATE users 
                SET role = 'owner' 
                WHERE id = $1 AND role = 'user'`,
                [decoded.id]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Vehicle listed successfully. Awaiting admin approval.',
                vehicle: vehicle[0]
            }, { status: 201 })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error listing vehicle:', error)
            return NextResponse.json(
                { error: 'Failed to list vehicle' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in vehicle listing:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}