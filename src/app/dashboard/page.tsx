'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type User = {
    id: number
    email: string
    name: string
    role: string
    is_admin: boolean
}

type OwnerRequest = {
    id: number
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [ownerRequest, setOwnerRequest] = useState<OwnerRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch user data and owner request status in parallel
                const [userRes, requestRes] = await Promise.all([
                    fetch('/api/user/me'),
                    fetch('/api/owner-request')
                ])

                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }

                const userData = await userRes.json()
                setUser(userData.user)

                if (requestRes.ok) {
                    const requestData = await requestRes.json()
                    setOwnerRequest(requestData.request)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    Please log in to access the dashboard
                </div>
            </div>
        )
    }

    const capitalizeFirstLetter = (str: string) => {
        return str.charAt(0).toUpperCase() + str.slice(1)
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, {user.name || 'User'}!</h2>
                <p className="text-gray-600 mb-4">
                    Email: {user.email}
                </p>
                <p className="text-gray-600">
                    Role: {user.role ? capitalizeFirstLetter(user.role) : 'User'}
                </p>
            </div>

            {user.role === 'user' && (
                <div className="bg-white shadow rounded-lg p-6">
                    {ownerRequest ? (
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Owner Request Status</h3>
                            <div className="mb-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${ownerRequest.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : ownerRequest.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {capitalizeFirstLetter(ownerRequest.status)}
                                </span>
                            </div>
                            {ownerRequest.admin_notes && (
                                <p className="text-gray-600">
                                    Admin Notes: {ownerRequest.admin_notes}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Become a Vehicle Owner</h3>
                            <p className="text-gray-600 mb-4">
                                List your vehicles and start earning by renting them out to our community.
                            </p>
                            <Link
                                href="/become-owner"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Become an Owner
                            </Link>
                        </div>
                    )}
                </div>
            )}

            {user.role === 'owner' && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-4">Owner Dashboard</h3>
                    <div className="space-y-4">
                        <Link
                            href="/dashboard/vehicles"
                            className="block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                        >
                            Manage Vehicles
                        </Link>
                        <Link
                            href="/dashboard/bookings"
                            className="block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-center"
                        >
                            View Bookings
                        </Link>
                    </div>
                </div>
            )}

            {user.is_admin && (
                <div className="bg-white shadow rounded-lg p-6 mt-6">
                    <h3 className="text-lg font-semibold mb-4">Admin Dashboard</h3>
                    <div className="space-y-4">
                        <Link
                            href="/admin/vehicles"
                            className="block px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                        >
                            Manage Vehicles
                        </Link>
                        <Link
                            href="/admin/owner-requests"
                            className="block px-6 py-3 bg-green-600 text-white rounded hover:bg-green-700 text-center"
                        >
                            Owner Requests
                        </Link>
                        <Link
                            href="/admin/users"
                            className="block px-6 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 text-center"
                        >
                            Manage Users
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
} 