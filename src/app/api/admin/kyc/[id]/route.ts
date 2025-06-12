import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const userId = params.id

    try {
        await pool.query(`UPDATE users SET is_kyc_verified = true WHERE id = $1`, [userId])
        await pool.query(`UPDATE kyc SET status = 'approved' WHERE user_id = $1`, [userId])
        return NextResponse.json({ success: true, message: 'KYC approved' })
    } catch (err) {
        console.error('Error approving KYC:', err)
        return NextResponse.json({ error: 'Failed to approve KYC' }, { status: 500 })
    }
}