import { cookies } from 'next/headers'
import { verifyJWT } from '@/lib/auth'
import pool from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET current user's KYC
export async function GET() {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyJWT(token)
    if (typeof decoded !== 'object' || !('id' in decoded)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const { rows } = await pool.query('SELECT * FROM kyc WHERE user_id = $1', [decoded.id])
    return NextResponse.json(rows[0] || {})
}

// POST new KYC submission
export async function POST(req: NextRequest) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const decoded = await verifyJWT(token)
    if (typeof decoded !== 'object' || !('id' in decoded)) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
    }

    const user = decoded as { id: number }
    const { full_name, dob, document_type, document_number, document_image_url, selfie_url } = await req.json()

    await pool.query(
        `INSERT INTO kyc (user_id, full_name, dob, document_type, document_number, document_image_url, selfie_url, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     ON CONFLICT (user_id) DO UPDATE SET 
       full_name = EXCLUDED.full_name,
       dob = EXCLUDED.dob,
       document_type = EXCLUDED.document_type,
       document_number = EXCLUDED.document_number,
       document_image_url = EXCLUDED.document_image_url,
       selfie_url = EXCLUDED.selfie_url,
       status = 'pending'`,
        [user.id, full_name, dob, document_type, document_number, document_image_url, selfie_url]
    )

    return NextResponse.json({ message: 'KYC submitted' }, { status: 201 })
}