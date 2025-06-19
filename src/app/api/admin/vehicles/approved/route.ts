import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function GET(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: JwtPayload | null = null;
    try {
        decoded = await verifyJWT(token) as JwtPayload;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all approved vehicles with owner information
    const { rows: vehicles } = await pool.query(
        `SELECT v.*, u.name as owner_name, u.email as owner_email
         FROM vehicles v
         JOIN users u ON v.owner_id = u.id
         WHERE v.status = 'approved'
         ORDER BY v.created_at DESC`
    );

    return NextResponse.json(vehicles);
} 