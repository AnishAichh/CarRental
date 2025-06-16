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
        // Destructure all required fields (excluding email, as it's from JWT)
        const {
            // Owner fields
            full_name,
            phone_number,
            address,
            government_id_type,
            government_id_number,
            id_image_url,
            selfie_url,
            // Vehicle fields
            vehicle_type,
            brand_model,
            registration_number,
            year_of_manufacture,
            fuel_type,
            transmission,
            seating_capacity,
            vehicle_photo_url,
            insurance_document_url,
            rc_document_url,
            price_per_day,
            available_from,
            available_to
        } = body

        // Validate required fields (excluding email)
        const missingFields = []
        for (const [key, value] of Object.entries({
            full_name, phone_number, address, government_id_type, government_id_number, id_image_url, selfie_url,
            vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity,
            vehicle_photo_url, insurance_document_url, rc_document_url, price_per_day, available_from
        })) {
            if (value === undefined || value === null || value === "") {
                missingFields.push(key)
            }
        }
        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(", ")}` },
                { status: 400 }
            )
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Check if user already has a pending or approved owner request
            const { rows: existingRequests } = await client.query(
                `SELECT id, status FROM owner_requests 
                WHERE user_id = $1 AND status IN ('pending', 'approved')`,
                [decoded.id]
            )

            if (existingRequests.length > 0) {
                await client.query('ROLLBACK')
                const status = existingRequests[0].status
                return NextResponse.json(
                    {
                        error: status === 'pending'
                            ? 'You already have a pending owner request'
                            : 'You are already an approved owner'
                    },
                    { status: 400 }
                )
            }

            // Insert into owner_requests
            const { rows: ownerRequestRows } = await client.query(
                `INSERT INTO owner_requests (
                    user_id, full_name, phone_number, email, address, government_id_type, government_id_number, id_image_url, selfie_url,
                    vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity,
                    vehicle_photo_url, insurance_document_url, rc_document_url, price_per_day, available_from, available_to
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22
                ) RETURNING *`,
                [
                    decoded.id, full_name, phone_number, decoded.email, address, government_id_type, government_id_number, id_image_url, selfie_url,
                    vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity,
                    vehicle_photo_url, insurance_document_url, rc_document_url, price_per_day, available_from, available_to
                ]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Owner request submitted successfully',
                request: ownerRequestRows[0]
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