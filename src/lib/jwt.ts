import jwt from 'jsonwebtoken'
import { User } from './types'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

type UserPayload = {
    id: number
    email: string
    role: 'user' | 'owner' | 'admin'
    isAdmin: boolean
    kycVerified: boolean
}

export function generateToken(payload: UserPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export async function verifyJWT(token: string): Promise<UserPayload> {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
        return decoded
    } catch (error) {
        throw new Error('Invalid token')
    }
} 