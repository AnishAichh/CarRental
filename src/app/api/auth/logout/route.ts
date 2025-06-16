import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    try {
        const cookieStore = await cookies()

        // Clear the token cookie
        cookieStore.delete('token')

        // Return success response
        return NextResponse.json(
            { message: 'Logged out successfully' },
            {
                status: 200,
                headers: {
                    'Set-Cookie': 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax'
                }
            }
        )
    } catch (error) {
        console.error('Logout error:', error)
        return NextResponse.json(
            { error: 'Failed to logout' },
            { status: 500 }
        )
    }
} 