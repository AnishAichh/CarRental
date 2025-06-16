import { User } from './types'

// Client-side API functions
export async function getAuthUser(): Promise<User> {
    try {
        const response = await fetch('/api/user/me', {
            credentials: 'include'
        })

        if (!response.ok) {
            throw new Error('Not authenticated')
        }

        const data = await response.json()
        return data.user
    } catch (error) {
        throw new Error('Not authenticated')
    }
}

export async function updateUserProfile(data: Partial<User>): Promise<User> {
    const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        throw new Error('Failed to update profile')
    }

    const result = await response.json()
    return result.user
}

export async function uploadKycDocuments(formData: FormData): Promise<User> {
    const response = await fetch('/api/user/kyc', {
        method: 'POST',
        credentials: 'include',
        body: formData,
    })

    if (!response.ok) {
        throw new Error('Failed to upload KYC documents')
    }

    const result = await response.json()
    return result.user
}

export async function login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    return data.user
}

export async function register(email: string, password: string, name: string): Promise<User> {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()
    return data.user
}

export async function logout(): Promise<void> {
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error('Logout failed')
    }
} 