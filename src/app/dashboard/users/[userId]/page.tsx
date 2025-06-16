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

type Booking = {
    id: number
    vehicle_name: string
    start_date: string
    end_date: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    total_amount: number
}

export default function UserDashboardPage({ params }: { params: { userId: string } }) {
    const [user, setUser] = useState<User | null>(null)
    const [ownerRequest, setOwnerRequest] = useState<OwnerRequest | null>(null)
    const [recentBookings, setRecentBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch user data, owner request status, and recent bookings in parallel
                const [userRes, requestRes, bookingsRes] = await Promise.all([
                    fetch('/api/user/me'),
                    fetch('/api/owner-request'),
                    fetch('/api/bookings/recent')
                ])

                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }

                const userData = await userRes.json()
                const currentUser = userData.user

                // Verify that the current user is accessing their own dashboard
                if (currentUser.id.toString() !== params.userId) {
                    router.push('/dashboard')
                    return
                }

                setUser(currentUser)

                if (requestRes.ok) {
                    const requestData = await requestRes.json()
                    setOwnerRequest(requestData.request)
                }

                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setRecentBookings(bookingsData.bookings)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.userId, router])

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
            <h1 className="text-2xl font-bold mb-6">User Dashboard</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* User Profile Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile</h2>
                    <div className="space-y-2">
                        <p className="text-gray-600">
                            <span className="font-medium">Name:</span> {user.name}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Email:</span> {user.email}
                        </p>
                        <p className="text-gray-600">
                            <span className="font-medium">Role:</span> {user.role ? capitalizeFirstLetter(user.role) : 'User'}
                        </p>
                    </div>
                </div>

                {/* Owner Request Status Card */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Owner Status</h2>
                    {ownerRequest ? (
                        <div className="space-y-4">
                            <div>
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
                                    <span className="font-medium">Admin Notes:</span> {ownerRequest.admin_notes}
                                </p>
                            )}
                            {ownerRequest.status === 'approved' && (
                                <Link
                                    href={`/dashboard/owners/${user.id}`}
                                    className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Go to Owner Dashboard
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                Want to list your vehicles and start earning? Become a vehicle owner!
                            </p>
                            <Link
                                href="/dashboard/become-owner"
                                className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Become an Owner
                            </Link>
                        </div>
                    )}
                </div>

                {/* Recent Bookings Card */}
                <div className="bg-white shadow rounded-lg p-6 md:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
                    {recentBookings.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {recentBookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">{booking.vehicle_name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs rounded-full ${booking.status === 'confirmed'
                                                    ? 'bg-green-100 text-green-800'
                                                    : booking.status === 'pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : booking.status === 'completed'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {capitalizeFirstLetter(booking.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">${booking.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-600">No recent bookings found.</p>
                    )}
                    <div className="mt-4">
                        <Link
                            href="/bookings"
                            className="text-blue-600 hover:text-blue-800"
                        >
                            View All Bookings →
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            {user.role !== 'owner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link
                        href={`/dashboard/user/browse-vehicles?user=${user.id}`}
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Browse Vehicles</h2>
                        <p className="text-gray-600">Find and book vehicles for your next trip.</p>
                    </Link>

                    <Link
                        href={`/dashboard/user/bookings?user=${user.id}`}
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h2>
                        <p className="text-gray-600">View and manage your current and past bookings.</p>
                    </Link>

                    {!user.kycVerified ? (
                        <Link
                            href={`/dashboard/kyc?user=${user.id}`}
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Complete KYC</h2>
                            <p className="text-gray-600">Verify your identity to unlock all features.</p>
                        </Link>
                    ) : (
                        user.role === 'user' && !ownerRequest && (
                            <Link
                                href="/dashboard/become-owner"
                                className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                            >
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Become an Owner</h2>
                                <p className="text-gray-600">List your vehicles and start earning.</p>
                            </Link>
                        )
                    )}
                </div>
            )}

            {/* Account Status */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Account Status</h2>
                <div className="space-y-4">
                    <p className="text-gray-600">
                        <span className="font-medium">KYC Verified:</span> {user.kycVerified ? 'Yes' : 'No'}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-medium">Admin:</span> {user.is_admin ? 'Yes' : 'No'}
                    </p>
                </div>
            </div>
        </div>
    )
} 