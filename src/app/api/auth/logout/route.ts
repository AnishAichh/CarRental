import { NextResponse } from 'next/server'

export async function POST() {
    // Create a response with cleared cookies
    const response = NextResponse.json({ success: true })

    // Set cookie options to ensure it's cleared
    response.cookies.set({
        name: 'token',
        value: '',
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    return response
} 