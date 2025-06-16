'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

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

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/dashboard/admin/kyc-requests')}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Review KYC Requests
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/admin/owner-requests')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Review Owner Requests
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                </div>

                {/* Platform Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Platform Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Vehicles</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Bookings</span>
                            <span className="font-medium">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
} 