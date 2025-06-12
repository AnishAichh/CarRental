import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyJWT } from './jwt'
import { User } from './types'

export type ApiResponse<T = any> = {
    success: boolean
    data?: T
    error?: string
    errorCode?: string
}

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({
        success: true,
        data,
    })
}

export function errorResponse(
    error: string,
    code?: string,
    status = 400
): NextResponse<ApiResponse> {
    return NextResponse.json(
        {
            success: false,
            error,
            errorCode: code,
        },
        { status }
    )
}

export async function getAuthUser(): Promise<User> {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    if (!token) {
        throw new Error('Not authenticated')
    }

    try {
        const payload = await verifyJWT(token)
        // Fetch additional user data from the database
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${payload.id}`, {
            headers: {
                'Cookie': `token=${token}`
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch user data')
        }

        const userData = await response.json()
        return {
            id: payload.id,
            email: payload.email,
            role: payload.role,
            isAdmin: payload.isAdmin,
            kycVerified: payload.kycVerified,
            name: userData.name || userData.email.split('@')[0],
            avatar: userData.avatar
        }
    } catch (error) {
        throw new Error('Invalid token')
    }
}

export function validateRequiredFields(
    data: Record<string, any>,
    fields: string[]
): string | null {
    for (const field of fields) {
        if (!data[field]) {
            return `${field} is required`
        }
    }
    return null
}

export function handleApiError(error: any): NextResponse<ApiResponse> {
    console.error('API Error:', error)

    if (error instanceof Error) {
        return errorResponse(error.message)
    }

    return errorResponse('An unexpected error occurred')
} 