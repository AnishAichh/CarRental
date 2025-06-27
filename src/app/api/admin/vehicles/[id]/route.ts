import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function PATCH(request: NextRequest) {
    const url = request.nextUrl
    const id = url.pathname.split("/").reverse()[1] // Extracts the [id] param
    try {
        const token = request.cookies.get('token')?.value
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const decoded = await verifyJWT(token) as JwtPayload
        if (!decoded || !decoded.id || !decoded.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { approved, availability } = await request.json() // optional fields

        if (approved !== undefined) {
            await pool.query(
                'UPDATE vehicles SET approved = $1 WHERE id = $2',
                [approved, id]
            )
        }
        if (availability !== undefined) {
            await pool.query(
                'UPDATE vehicles SET availability = $1 WHERE id = $2',
                [availability, id]
            )
        }

        return NextResponse.json({ message: `Received PATCH for vehicle id: ${id}` })
    } catch (error) {
        console.error('Error in vehicle PATCH endpoint:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}