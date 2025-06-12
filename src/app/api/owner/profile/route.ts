import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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
            // Get owner profile with business statistics
            const { rows: profile } = await client.query(
                `SELECT 
                    u.*,
                    COUNT(DISTINCT v.id) as total_vehicles,
                    COUNT(DISTINCT CASE WHEN v.approved = true THEN v.id END) as approved_vehicles,
                    COUNT(DISTINCT b.id) as total_bookings,
                    COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_amount ELSE 0 END), 0) as total_revenue,
                    COALESCE(AVG(CASE WHEN vr.status = 'approved' THEN vr.rating ELSE NULL END), 0) as average_rating
                FROM users u
                LEFT JOIN vehicles v ON u.id = v.owner_id
                LEFT JOIN bookings b ON v.id = b.vehicle_id
                LEFT JOIN vehicle_review_requests vr ON v.id = vr.vehicle_id
                WHERE u.id = $1
                GROUP BY u.id`,
                [decoded.id]
            )

            if (profile.length === 0) {
                return NextResponse.json(
                    { error: 'Profile not found' },
                    { status: 404 }
                )
            }

            // Remove sensitive information
            const { password, ...profileData } = profile[0]

            return NextResponse.json({ profile: profileData })
        } catch (error) {
            console.error('Error fetching profile:', error)
            return NextResponse.json(
                { error: 'Failed to fetch profile' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in profile endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

export async function PUT(request: NextRequest) {
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
            email,
            phone,
            current_password,
            new_password,
            address,
            bio
        } = body

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // If changing password, verify current password
            if (new_password) {
                if (!current_password) {
                    await client.query('ROLLBACK')
                    return NextResponse.json(
                        { error: 'Current password is required to set new password' },
                        { status: 400 }
                    )
                }

                const { rows: userRows } = await client.query(
                    'SELECT password FROM users WHERE id = $1',
                    [decoded.id]
                )

                if (userRows.length === 0) {
                    await client.query('ROLLBACK')
                    return NextResponse.json(
                        { error: 'User not found' },
                        { status: 404 }
                    )
                }

                const isValidPassword = await bcrypt.compare(
                    current_password,
                    userRows[0].password
                )

                if (!isValidPassword) {
                    await client.query('ROLLBACK')
                    return NextResponse.json(
                        { error: 'Current password is incorrect' },
                        { status: 401 }
                    )
                }

                // Hash new password
                const hashedPassword = await bcrypt.hash(new_password, 10)
                await client.query(
                    'UPDATE users SET password = $1 WHERE id = $2',
                    [hashedPassword, decoded.id]
                )
            }

            // Update other profile fields
            const { rows: updatedProfile } = await client.query(
                `UPDATE users 
                SET 
                    name = COALESCE($1, name),
                    email = COALESCE($2, email),
                    phone = COALESCE($3, phone),
                    address = COALESCE($4, address),
                    bio = COALESCE($5, bio),
                    updated_at = NOW()
                WHERE id = $6
                RETURNING id, name, email, phone, address, bio, role, is_kyc_verified, created_at, updated_at`,
                [name, email, phone, address, bio, decoded.id]
            )

            await client.query('COMMIT')

            return NextResponse.json({
                message: 'Profile updated successfully',
                profile: updatedProfile[0]
            })
        } catch (error) {
            await client.query('ROLLBACK')
            console.error('Error updating profile:', error)
            return NextResponse.json(
                { error: 'Failed to update profile' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in profile update:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 