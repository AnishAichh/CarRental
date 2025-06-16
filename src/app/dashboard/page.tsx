'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'

export default function UserDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (!res.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await res.json()
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600">
                    Browse vehicles, manage your bookings, and update your profile.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Link
                    href="/vehicles"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Browse Vehicles
                            </h2>
                            <p className="text-gray-600">
                                Find and book your perfect ride
                            </p>
                        </div>
                        <span className="text-2xl">🔍</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/bookings"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                My Bookings
                            </h2>
                            <p className="text-gray-600">
                                View and manage your bookings
                            </p>
                        </div>
                        <span className="text-2xl">📋</span>
                    </div>
                </Link>

                <Link
                    href="/dashboard/profile"
                    className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">
                                Profile
                            </h2>
                            <p className="text-gray-600">
                                Update your personal information
                            </p>
                        </div>
                        <span className="text-2xl">⚙️</span>
                    </div>
                </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity
                </h2>
                <div className="space-y-4">
                    {/* Placeholder for recent bookings */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-gray-900 font-medium">No recent activity</p>
                            <p className="text-gray-600 text-sm">
                                Your recent bookings will appear here
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 