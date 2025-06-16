// File: src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const { email, password, name } = await req.json()

        // Check if user already exists
        const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email])
        if (existing.rows.length > 0) {
            return NextResponse.json(
                {
                    error: 'You already have an account. Please login.',
                    code: 'EMAIL_EXISTS'
                },
                { status: 400 }
            )
        }

        // Hash password
        const hash = await bcrypt.hash(password, 10)

        // Insert new user with default role
        const result = await pool.query(
            `INSERT INTO users (
                email, 
                password, 
                name, 
                role,
                is_kyc_verified
            ) VALUES ($1, $2, $3, 'user', false) 
            RETURNING id, email, name, role, is_admin, is_kyc_verified`,
            [email, hash, name]
        )

        const user = result.rows[0]

        // Generate token and set cookie
        const token = await generateToken({
            id: user.id,
            email: user.email,
            role: user.role,
            isAdmin: user.is_admin,
            kycVerified: user.is_kyc_verified
        })

        const res = NextResponse.json({
            message: 'Registration successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        })

        // Set the token cookie
        res.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return res
    } catch (err) {
        console.error('Register error:', err)
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        )
    }
}