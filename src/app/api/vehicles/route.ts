import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const location = searchParams.get('location')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        console.log('Search params:', { location, startDate, endDate })

        const client = await pool.connect()
        try {
            let query = `
                SELECT 
                    v.*,
                    u.name as owner_name,
                    u.email as owner_email
                FROM vehicles v
                JOIN users u ON v.owner_id = u.id
                WHERE v.approved_by_admin = true
                AND v.availability = true
            `
            const queryParams: any[] = []
            let paramCount = 1

            if (location) {
                query += ` AND LOWER(v.location) LIKE LOWER($${paramCount})`
                queryParams.push(`%${location}%`)
                paramCount++
            }

            if (startDate && endDate) {
                query += `
                    AND NOT EXISTS (
                        SELECT 1 FROM bookings b
                        WHERE b.vehicle_id = v.id
                        AND b.status = 'confirmed'
                        AND (
                            (b.start_date <= $${paramCount}::date AND b.end_date >= $${paramCount}::date)
                            OR (b.start_date <= $${paramCount + 1}::date AND b.end_date >= $${paramCount + 1}::date)
                            OR (b.start_date >= $${paramCount}::date AND b.end_date <= $${paramCount + 1}::date)
                        )
                    )
                `
                queryParams.push(startDate, endDate)
                paramCount += 2
            }

            query += ` ORDER BY v.created_at DESC`

            console.log('Query:', query)
            console.log('Params:', queryParams)

            const { rows: vehicles } = await client.query(query, queryParams)
            console.log('Found vehicles:', vehicles.length)

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
    console.log('=== VEHICLE SUBMISSION START ===');
    try {
        const token = request.cookies.get('token')?.value;
        console.log('Token found:', !!token);

        if (!token) {
            console.log('No token found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyJWT(token) as JwtPayload;
        console.log('Decoded token:', decoded);

        if (!decoded || !decoded.id) {
            console.log('Invalid token');
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', body);

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            console.log('Transaction started');

            // Fetch the latest owner request for the user (regardless of status)
            const { rows: ownerRows } = await client.query(
                `SELECT * FROM owner_requests 
                WHERE user_id = $1
                ORDER BY created_at DESC
                LIMIT 1`,
                [decoded.id]
            );
            console.log('Owner rows found (any status):', ownerRows);

            if (ownerRows.length === 0) {
                await client.query('ROLLBACK');
                console.log('User has no owner application submitted.');
                return NextResponse.json(
                    { error: 'You must submit an owner application before listing a vehicle.' },
                    { status: 403 }
                );
            }

            const ownerInfo = ownerRows[0];
            console.log('Owner info for vehicle submission:', ownerInfo);

            const formData = await request.formData();
            console.log('Form data received');

            // Insert vehicle with details from body, falling back to ownerInfo if needed
            const { rows: vehicleRows } = await client.query(
                `INSERT INTO vehicles (
                    owner_id,
                    name,
                    brand,
                    model,
                    year,
                    color,
                    registration_number,
                    license_plate,
                    vin,
                    mileage,
                    fuel_type,
                    transmission,
                    seats,
                    doors,
                    daily_rate,
                    weekly_rate,
                    monthly_rate,
                    description,
                    features,
                    rules,
                    status,
                    is_available,
                    location,
                    latitude,
                    longitude,
                    created_at,
                    updated_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, NOW(), NOW())
                RETURNING *`,
                [
                    decoded.id,
                    body.name,
                    body.brand,
                    body.model,
                    body.year,
                    body.color,
                    body.registration_number,
                    body.license_plate,
                    body.vin,
                    body.mileage,
                    body.fuel_type,
                    body.transmission,
                    body.seats,
                    body.doors,
                    body.daily_rate,
                    body.weekly_rate,
                    body.monthly_rate,
                    body.description,
                    body.features,
                    body.rules,
                    'pending',
                    false,
                    body.location,
                    body.latitude,
                    body.longitude
                ]
            )

            // Insert into owner_requests
            const ownerRequestsPayload = {
                user_id: decoded.id,
                full_name: ownerInfo.full_name || 'N/A',
                phone_number: ownerInfo.phone_number || '0000000000',
                email: ownerInfo.email || decoded.email,
                address: ownerInfo.address || 'N/A',
                government_id_type: ownerInfo.government_id_type || 'aadhar',
                government_id_number: ownerInfo.government_id_number || '000000000000',
                id_image_url: ownerInfo.id_image_url || 'N/A',
                selfie_url: ownerInfo.selfie_url || 'N/A',
                vehicle_type: body.type || ownerInfo.vehicle_type || 'car',
                brand_model: body.brand || ownerInfo.brand_model || 'Unknown',
                registration_number: body.registration_number || ownerInfo.registration_number || 'XX00XX0000',
                year_of_manufacture: body.year_of_manufacture || ownerInfo.year_of_manufacture || 2024,
                fuel_type: body.fuel_type || ownerInfo.fuel_type || 'petrol',
                transmission: body.transmission || ownerInfo.transmission || 'manual',
                seating_capacity: body.seating_capacity || ownerInfo.seating_capacity || 4,
                vehicle_photo_url: body.image_url || body.vehicle_photo_url || ownerInfo.vehicle_photo_url || 'N/A',
                insurance_document_url: body.insurance_document_url || ownerInfo.insurance_document_url || 'N/A',
                rc_document_url: body.rc_document_url || ownerInfo.rc_document_url || 'N/A',
                price_per_day: body.price_per_day || ownerInfo.price_per_day || 1000,
                available_from: body.available_from || ownerInfo.available_from || new Date().toISOString().split('T')[0],
                available_to: body.available_to || ownerInfo.available_to || null,
                status: 'pending',
                request_type: 'vehicle_submission',
                vehicle_id: vehicleRows[0].id
            };

            console.log("Owner Request Payload for Vehicle Submission:", ownerRequestsPayload);

            await client.query(
                `INSERT INTO owner_requests (
                    user_id, full_name, phone_number, email, address, government_id_type, government_id_number, id_image_url, selfie_url,
                    vehicle_type, brand_model, registration_number, year_of_manufacture, fuel_type, transmission, seating_capacity,
                    vehicle_photo_url, insurance_document_url, rc_document_url, price_per_day, available_from, available_to,
                    status, request_type, vehicle_id
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9,
                    $10, $11, $12, $13, $14, $15, $16,
                    $17, $18, $19, $20, $21, $22,
                    $23, $24, $25
                )`,
                [
                    ownerRequestsPayload.user_id,
                    ownerRequestsPayload.full_name,
                    ownerRequestsPayload.phone_number,
                    ownerRequestsPayload.email,
                    ownerRequestsPayload.address,
                    ownerRequestsPayload.government_id_type,
                    ownerRequestsPayload.government_id_number,
                    ownerRequestsPayload.id_image_url,
                    ownerRequestsPayload.selfie_url,
                    ownerRequestsPayload.vehicle_type,
                    ownerRequestsPayload.brand_model,
                    ownerRequestsPayload.registration_number,
                    ownerRequestsPayload.year_of_manufacture,
                    ownerRequestsPayload.fuel_type,
                    ownerRequestsPayload.transmission,
                    ownerRequestsPayload.seating_capacity,
                    ownerRequestsPayload.vehicle_photo_url,
                    ownerRequestsPayload.insurance_document_url,
                    ownerRequestsPayload.rc_document_url,
                    ownerRequestsPayload.price_per_day,
                    ownerRequestsPayload.available_from,
                    ownerRequestsPayload.available_to,
                    ownerRequestsPayload.status,
                    ownerRequestsPayload.request_type,
                    ownerRequestsPayload.vehicle_id
                ]
            );

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Vehicle listed successfully. Awaiting admin approval.',
                vehicle: vehicleRows[0]
            }, { status: 201 })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error listing vehicle:', error);
            if (error && typeof error === 'object' && 'detail' in error) {
                console.error('DB Error Detail:', error.detail);
            }
            if (error && typeof error === 'object' && 'code' in error) {
                console.error('DB Error Code:', error.code);
            }
            return NextResponse.json(
                { error: 'Failed to list vehicle' },
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