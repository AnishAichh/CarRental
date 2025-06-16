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
            // Get all vehicles owned by the user with booking statistics
            const { rows: vehicles } = await client.query(
                `SELECT 
                    v.*,
                    COALESCE(COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'confirmed'), 0) as total_bookings,
                    COALESCE(COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'pending'), 0) as pending_bookings,
                    0 as total_revenue,
                    0 as rating
                FROM vehicles v
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                WHERE v.owner_id = $1
                GROUP BY v.id
                ORDER BY v.created_at DESC`,
                [decoded.id]
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
        // Fetch the latest approved owner request for this user
        const client = await pool.connect()
        let ownerProfile = null
        try {
            const { rows: ownerRows } = await client.query(
                `SELECT * FROM owner_requests WHERE user_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 1`,
                [decoded.id]
            )
            ownerProfile = ownerRows[0] || {}
        } catch (e) {
            // fallback: no owner profile
            ownerProfile = {}
        }
        // Use form data, fallback to ownerProfile for missing fields
        const name = body.name || ownerProfile.brand_model
        const model = body.model || ownerProfile.brand_model
        const year = body.year || ownerProfile.year_of_manufacture
        const price_per_day = body.price_per_day || ownerProfile.price_per_day
        const image_url = body.image_url || ownerProfile.vehicle_photo_url
        const description = body.description || ''
        const features = body.features || ''
        const location = body.location || ownerProfile.location
        const registration_number = body.registration_number || ownerProfile.registration_number
        const insurance_details = body.insurance_details || ownerProfile.insurance_document_url
        const documents = body.documents || ownerProfile.rc_document_url
        // Validate required fields
        if (!name || !model || !year || !price_per_day || !registration_number) {
            client.release()
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }
        try {
            await client.query('BEGIN')
            // Insert new vehicle
            const { rows: [vehicle] } = await client.query(
                `INSERT INTO vehicles (
                    owner_id,
                    name,
                    model,
                    year,
                    price_per_day,
                    image_url,
                    description,
                    features,
                    location,
                    registration_number,
                    insurance_details,
                    documents,
                    status,
                    is_available,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
                RETURNING *`,
                [
                    decoded.id,
                    name,
                    model,
                    year,
                    price_per_day,
                    image_url,
                    description,
                    features,
                    location,
                    registration_number,
                    insurance_details,
                    documents,
                    'pending_approval',
                    false
                ]
            )
            await client.query('COMMIT')
            return NextResponse.json({ vehicle })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error adding vehicle:', error)
            return NextResponse.json(
                { error: 'Failed to add vehicle' },
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