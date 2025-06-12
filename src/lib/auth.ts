import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export interface UserPayload {
    id: number
    email: string
    role: 'user' | 'owner' | 'admin'
    isAdmin: boolean
    kycVerified: boolean
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export async function generateToken(payload: UserPayload) {
    return await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(secret)
}

export async function verifyJWT(token: string): Promise<UserPayload> {
    try {
        const { payload } = await jwtVerify(token, secret)
        return {
            id: payload.id as number,
            email: payload.email as string,
            role: payload.role as 'user' | 'owner' | 'admin',
            isAdmin: payload.isAdmin as boolean,
            kycVerified: payload.kycVerified as boolean
        }
    } catch (error) {
        throw new Error('Invalid token')
    }
}

export async function getAuthUser(): Promise<UserPayload | null> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value

    if (!token) {
        return null
    }

    try {
        return await verifyJWT(token)
    } catch (error) {
        return null
    }
}
