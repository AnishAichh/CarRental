import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { verifyJWT } from '@/lib/auth'
import { JwtPayload } from 'jsonwebtoken'

export async function POST(request: NextRequest) {
    const url = request.nextUrl;
    const id = url.pathname.split("/").reverse()[2]; // Extracts the [id] param
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyJWT(token) as JwtPayload;
        if (!decoded || !decoded.id || !decoded.isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update vehicle status to approved and make it available
        const { rows } = await pool.query(
            `UPDATE vehicles 
             SET status = 'approved', is_available = true
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Vehicle not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: `Received POST for vehicle approve id: ${id}` });
    } catch (error) {
        console.error('Error in vehicle approve endpoint:', error);
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
    }
} 