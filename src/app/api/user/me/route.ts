import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT, refreshJWTIfNeeded } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'
import { User } from '@/lib/types'

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
            // Get user details with role and KYC status
            const { rows: userRows } = await client.query(
                `SELECT 
                    u.*,
                    k.status as kyc_status,
                    k.created_at as kyc_created_at,
                    COUNT(DISTINCT CASE WHEN v.approved_by_admin = true THEN v.id END) as approved_vehicles
                FROM users u
                LEFT JOIN kyc k ON u.id = k.user_id
                LEFT JOIN vehicles v ON u.id = v.owner_id
                WHERE u.id = $1
                GROUP BY u.id, k.status, k.created_at
                ORDER BY k.created_at DESC
                LIMIT 1`,
                [decoded.id]
            )

            if (userRows.length === 0) {
                return NextResponse.json(
                    { error: 'User not found' },
                    { status: 404 }
                )
            }

            // Remove sensitive information and map to frontend User type
            const userFromDb = userRows[0]
            const user: User = {
                id: userFromDb.id,
                name: userFromDb.name,
                email: userFromDb.email,
                role: userFromDb.role, // 'user' | 'owner' | 'admin'
                avatar: userFromDb.avatar,
                kycVerified: userFromDb.kyc_status === 'approved',
                isAdmin: userFromDb.is_admin,
            }

            // Prepare response
            let response = NextResponse.json({ user: user })
            // Refresh JWT if needed
            await refreshJWTIfNeeded(token, response)
            return response
        } catch (error) {
            console.error('Error fetching user:', error)
            return NextResponse.json(
                { error: 'Failed to fetch user data' },
                { status: 500 }
            )
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error in user/me endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
} 