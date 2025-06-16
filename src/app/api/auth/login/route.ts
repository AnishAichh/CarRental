import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { generateToken } from '@/lib/auth'
import pool from '@/lib/db'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        // Get user from database
        const { rows } = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )

        if (rows.length === 0) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        const user = rows[0]
        console.log('✅ Login attempt:', email)
        console.log('Entered password:', JSON.stringify(password))
        console.log('Stored hash:', user.password)

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password)
        console.log('✅ Password match:', passwordMatch)

        if (!passwordMatch) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // Generate JWT token
        const token = await generateToken({
            id: user.id,
            email: user.email,
            role: user.is_admin ? 'admin' : user.role,
            isAdmin: !!user.is_admin,
            kycVerified: !!user.is_kyc_verified
        })

        // Set HTTP-only cookie
        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.is_admin ? 'admin' : user.role,
                isAdmin: !!user.is_admin,
                kycVerified: !!user.is_kyc_verified
            }
        })

        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        })

        return response
    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Login failed' },
            { status: 500 }
        )
    }
}
