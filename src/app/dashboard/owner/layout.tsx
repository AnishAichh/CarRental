'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'

export default function OwnerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (!res.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await res.json()
                if (data.user.role !== 'owner') {
                    router.push('/dashboard')
                    return
                }
                setUser(data.user)
            } catch (error) {
                console.error('Error fetching user:', error)
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [router])

    const handleLogout = async () => {
        try {
            const res = await fetch('/api/auth/logout', {
                method: 'POST',
            })
            if (res.ok) {
                router.push('/login')
            }
        } catch (error) {
            console.error('Error logging out:', error)
        }
    }

    // Common navigation items for both modes
    const commonNavItems = [
        { href: '/dashboard', label: 'Dashboard', icon: '📊' },
        { href: '/vehicles', label: 'Browse Vehicles', icon: '🔍' },
        { href: '/dashboard/bookings', label: 'My Bookings', icon: '📋' },
        { href: '/dashboard/profile', label: 'Profile', icon: '⚙️' },
    ]
    // Additional navigation items for owner mode
    const ownerNavItems = [
        { href: '/dashboard/owner/vehicles', label: 'My Vehicles', icon: '🚗' },
        { href: '/dashboard/owner/earnings', label: 'Earnings', icon: '💰' },
    ]
    // Always show all nav items for owner
    const userId = searchParams?.get('user') || user?.id
    const navItems = [
        ...commonNavItems,
        { href: `/dashboard/vehicles${userId ? `?user=${userId}` : ''}`, label: 'Browse Vehicles', icon: '🔍' },
        { href: `/dashboard/bookings${userId ? `?user=${userId}` : ''}`, label: 'My Bookings', icon: '📋' },
        { href: `/dashboard/profile${userId ? `?user=${userId}` : ''}`, label: 'Profile', icon: '⚙️' },
        ...ownerNavItems,
    ]
    const currentPath = pathname || '/dashboard'
    const currentSection = currentPath.split('/').pop() || ''

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Breadcrumb Navigation */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-12">
                        <nav className="flex" aria-label="Breadcrumb">
                            <ol className="flex items-center space-x-2 text-sm">
                                <li>
                                    <Link
                                        href="/dashboard/owner"
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Owner Dashboard
                                    </Link>
                                </li>
                                {currentPath !== '/dashboard/owner' && currentSection && (
                                    <li>
                                        <span className="text-gray-400 mx-2">/</span>
                                        <span className="text-gray-700">
                                            {currentSection.split('-').map(word =>
                                                word.charAt(0).toUpperCase() + word.slice(1)
                                            ).join(' ')}
                                        </span>
                                    </li>
                                )}
                            </ol>
                        </nav>
                    </div>
                </div>
            </div>
            {/* Main Content */}
            <main className="py-6">
                {children}
            </main>
        </div>
    )
} 