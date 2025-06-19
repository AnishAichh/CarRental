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
        console.log('DECODED JWT:', decoded);
        console.log('TOKEN:', token);
    } catch (err) {
        console.error('JWT VERIFY ERROR:', err);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!decoded || !decoded.id) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify if user is admin
    const { rows: adminRows } = await pool.query(
        'SELECT * FROM users WHERE id = $1 AND role = $2',
        [decoded.id, 'admin']
    );

    if (adminRows.length === 0) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all pending vehicles with owner information
    const { rows: vehicles } = await pool.query(
        `SELECT v.*, json_build_object('name', u.name, 'email', u.email) as owner
         FROM vehicles v
         JOIN users u ON v.owner_id = u.id
         WHERE v.status = 'pending_approval'
         ORDER BY v.created_at DESC`
    );

    return NextResponse.json(vehicles);
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = request.cookies.get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let decoded: JwtPayload | null = null;
    try {
        decoded = await verifyJWT(token) as JwtPayload;
        console.log('DECODED JWT:', decoded);
    } catch (err) {
        console.error('JWT VERIFY ERROR:', err);
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!decoded || decoded.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const vehicleId = params.id;

    // Update vehicle status to approved and make it available
    const { rows } = await pool.query(
        `UPDATE vehicles 
         SET status = 'approved', is_available = true
         WHERE id = $1
         RETURNING *`,
        [vehicleId]
    );

    if (rows.length === 0) {
        return NextResponse.json(
            { error: 'Vehicle not found' },
            { status: 404 }
        );
    }

    return NextResponse.json({ message: 'Vehicle approved successfully' });
} 