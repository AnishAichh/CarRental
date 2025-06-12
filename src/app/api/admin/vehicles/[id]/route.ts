import { cookies } from 'next/headers'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = verifyJWT(token)
    if (typeof decoded !== 'object' || decoded.is_admin !== true) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { approved, availability } = await req.json() // optional fields

    try {
        if (approved !== undefined) {
            await pool.query(
                'UPDATE vehicles SET approved = $1 WHERE id = $2',
                [approved, params.id]
            )
        }
        if (availability !== undefined) {
            await pool.query(
                'UPDATE vehicles SET availability = $1 WHERE id = $2',
                [availability, params.id]
            )
        }

        return NextResponse.json({ message: 'Vehicle updated' })
    } catch {
        return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }
}