import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'

export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyJWT(token)
    if (typeof decoded !== 'object' || decoded.isAdmin !== true) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    try {
        const { rows } = await pool.query(`
      SELECT k.id, k.full_name, k.dob, k.document_type, k.document_number, k.document_image_url, k.selfie_url, k.status, u.email
      FROM kyc k
      JOIN users u ON u.id = k.user_id
      WHERE k.status = 'pending'
    `)
        return NextResponse.json(rows)
    } catch (err) {
        console.error('KYC fetch error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
