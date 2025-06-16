import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export interface UserPayload {
    id: number
    email: string
    role: 'user' | 'owner' | 'admin'
    isAdmin: boolean
    kycVerified: boolean
}

// Use a more secure secret key
const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-secret-key-should-be-at-least-32-characters-long'
)

export async function generateToken(payload: UserPayload) {
    try {
        return await new SignJWT({ ...payload })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('7d')
            .sign(secret)
    } catch (error) {
        console.error('Error generating token:', error)
        throw new Error('Failed to generate token')
    }
}

export async function verifyJWT(token: string): Promise<UserPayload> {
    try {
        const { payload } = await jwtVerify(token, secret)

        // Validate required fields
        if (!payload.id || !payload.email || !payload.role) {
            throw new Error('Invalid token payload')
        }

        return {
            id: Number(payload.id),
            email: String(payload.email),
            role: String(payload.role) as 'user' | 'owner' | 'admin',
            isAdmin: Boolean(payload.isAdmin),
            kycVerified: Boolean(payload.kycVerified)
        }
    } catch (error) {
        console.error('Token verification error:', error)
        throw new Error('Invalid token')
    }
}

export async function getAuthUser(): Promise<UserPayload | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value

        if (!token) {
            return null
        }

        return await verifyJWT(token)
    } catch (error) {
        console.error('Error getting auth user:', error)
        return null
    }
}

export async function refreshJWTIfNeeded(token: string, res: InstanceType<typeof NextResponse>) {
    try {
        const decoded = await verifyJWT(token)
        if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) return

        // TODO: Replace direct DB query with an API call if this function is used in an environment without Node.js 'pg' support.
        // Fetch latest user info from DB
        // const { rows } = await pool.query('SELECT id, email, role, is_admin, kyc_status FROM users WHERE id = $1', [decoded.id])
        // const dbUser = rows[0]
        // if (!dbUser) return

        // For now, we will assume the token is up-to-date and skip DB refresh in the auth library.
        // This function will likely be refactored or moved to an API route.

    } catch (error) {
        // Ignore errors, don't break the main flow
        console.error('refreshJWTIfNeeded error:', error)
    }
}
