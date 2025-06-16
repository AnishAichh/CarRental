'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const [isOwnerMode, setIsOwnerMode] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user/me')
                if (!response.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                console.error('Error fetching user:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    const handleLogout = async () => {
        try {
            const response = await fetch('/api/auth/logout', {
                method: 'POST',
            })
            if (response.ok) {
                router.push('/login')
            }
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    const handleModeSwitch = () => {
        setIsOwnerMode(!isOwnerMode)
        // No redirects, just update the mode
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="animate-pulse">
                    <div className="h-16 bg-gray-200"></div>
                    <div className="max-w-7xl mx-auto p-6">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user || !(user.is_admin || user.isAdmin)) {
        return (
            <div className="p-8 text-red-600 bg-white">
                <h2>Not an admin or user not loaded</h2>
                <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Main Content */}
            <main className="py-6">
                {children}
            </main>
        </div>
    )
} 