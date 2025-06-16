'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'

export default function UserDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me')
                if (!res.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await res.json()
                setUser(data.user)

                // Redirect if user is not a regular user
                if (data.user.role === 'owner') {
                    router.push(`/dashboard/owner?user=${data.user.id}`)
                } else if (data.user.role === 'admin') {
                    router.push('/dashboard/admin')
                }
            } catch (err) {
                console.error('Error fetching user:', err)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    )
} 