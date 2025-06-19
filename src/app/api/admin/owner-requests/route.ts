import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { JwtPayload } from 'jsonwebtoken'
import { cookies } from 'next/headers'

export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const decoded = await verifyJWT(token.value)
        if (!decoded || !decoded.isAdmin) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const result = await pool.query(`
            SELECT
                oreq.id,
                oreq.user_id,
                oreq.full_name,
                oreq.phone_number,
                oreq.email,
                oreq.address,
                oreq.government_id_type,
                oreq.government_id_number,
                oreq.id_image_url,
                oreq.selfie_url,
                oreq.vehicle_type as owner_request_vehicle_type,
                oreq.brand_model as owner_request_brand_model,
                oreq.registration_number as owner_request_registration_number,
                oreq.year_of_manufacture as owner_request_year_of_manufacture,
                oreq.fuel_type as owner_request_fuel_type,
                oreq.transmission as owner_request_transmission,
                oreq.seating_capacity as owner_request_seating_capacity,
                oreq.vehicle_photo_url as owner_request_vehicle_photo_url,
                oreq.insurance_document_url as owner_request_insurance_document_url,
                oreq.rc_document_url as owner_request_rc_document_url,
                oreq.price_per_day as owner_request_price_per_day,
                oreq.available_from as owner_request_available_from,
                oreq.available_to as owner_request_available_to,
                oreq.status,
                oreq.admin_notes,
                oreq.created_at,
                oreq.updated_at,
                oreq.request_type,
                oreq.vehicle_id,
                u.email as user_email,
                u.name as user_name,
                v.id as vehicle_id_from_vehicles,
                v.name as vehicle_name,
                v.brand as vehicle_brand,
                v.model as vehicle_model,
                v.year as vehicle_year,
                v.price_per_day as vehicle_price_per_day,
                v.image_url as vehicle_image_url,
                v.registration_number as vehicle_registration_number,
                v.fuel_type as vehicle_fuel_type,
                v.transmission as vehicle_transmission,
                v.seating_capacity as vehicle_seating_capacity,
                v.insurance_details as vehicle_insurance_details,
                v.documents as vehicle_documents,
                v.status as vehicle_status,
                v.is_available as vehicle_is_available
            FROM owner_requests oreq
            LEFT JOIN users u ON oreq.user_id = u.id
            LEFT JOIN vehicles v ON oreq.vehicle_id = v.id
            ORDER BY oreq.created_at DESC
        `)

        const requests = result.rows.map(row => ({
            id: row.id,
            user_id: row.user_id,
            status: row.status,
            created_at: row.created_at,
            full_name: row.full_name,
            phone_number: row.phone_number,
            email: row.email,
            government_id_type: row.government_id_type,
            government_id_number: row.government_id_number,
            id_image_url: row.id_image_url,
            selfie_url: row.selfie_url,
            request_type: row.request_type,
            admin_notes: row.admin_notes,
            user: {
                id: row.user_id,
                name: row.user_name,
                email: row.user_email
            },
            // Conditionally include vehicle details if it's a vehicle submission
            ...(row.request_type === 'vehicle_submission' && {
                vehicle_id: row.vehicle_id_from_vehicles,
                name: row.vehicle_name,
                brand: row.vehicle_brand,
                model: row.vehicle_model,
                year: row.vehicle_year,
                price_per_day: row.vehicle_price_per_day,
                image_url: row.vehicle_image_url,
                registration_number: row.vehicle_registration_number,
                fuel_type: row.vehicle_fuel_type,
                transmission: row.vehicle_transmission,
                seating_capacity: row.vehicle_seating_capacity,
                insurance_details: row.vehicle_insurance_details,
                documents: row.vehicle_documents,
                vehicle_status: row.vehicle_status,
                is_available: row.vehicle_is_available,
            }),
            // For owner_application, use the owner_request specific vehicle fields if needed, 
            // or they can be null/undefined as they are not primary for this type
            ...(row.request_type === 'owner_application' && {
                vehicle_type: row.owner_request_vehicle_type,
                brand_model: row.owner_request_brand_model,
                registration_number: row.owner_request_registration_number,
                year_of_manufacture: row.owner_request_year_of_manufacture,
                fuel_type: row.owner_request_fuel_type,
                transmission: row.owner_request_transmission,
                seating_capacity: row.owner_request_seating_capacity,
                vehicle_photo_url: row.owner_request_vehicle_photo_url,
                insurance_document_url: row.owner_request_insurance_document_url,
                rc_document_url: row.owner_request_rc_document_url,
                price_per_day: row.owner_request_price_per_day,
                available_from: row.owner_request_available_from,
                available_to: row.owner_request_available_to,
            })
        }))

        return NextResponse.json({ requests })
    } catch (error) {
        console.error('Error fetching owner requests:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
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
        if (!decoded || !decoded.id || !decoded.isAdmin) {
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