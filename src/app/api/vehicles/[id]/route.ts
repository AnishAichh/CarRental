import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

// GET /api/vehicles/[id]
export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        const { id } = await context.params

        // Get vehicle with owner details
        const { rows } = await pool.query(
            `SELECT 
                v.*,
                u.name as owner_name,
                u.email as owner_email
            FROM vehicles v
            LEFT JOIN users u ON v.owner_id = u.id
            WHERE v.id = $1 AND v.approved = true AND v.availability = true`,
            [id]
        )

        if (rows.length === 0) {
            return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
        }

        // Check if user is owner or admin
        const token = request.cookies.get('token')?.value
        if (token) {
            const decoded = await verifyJWT(token) as JwtPayload
            if (decoded && decoded.id) {
                const { rows: userRows } = await pool.query(
                    'SELECT is_admin FROM users WHERE id = $1',
                    [decoded.id]
                )
                if (userRows.length > 0) {
                    const user = userRows[0]
                    if (user.is_admin || user.id === rows[0].owner_id) {
                        // Include additional details for owner/admin
                        return NextResponse.json({
                            ...rows[0],
                            is_owner: user.id === rows[0].owner_id,
                            is_admin: user.is_admin
                        })
                    }
                }
            }
        }

        // For regular users, return basic vehicle info
        return NextResponse.json(rows[0])
    } catch (error) {
        console.error('Error in /api/vehicles/[id]:', error)
        return NextResponse.json(
            { error: 'Failed to fetch vehicle details' },
            { status: 500 }
        )
    }
}
