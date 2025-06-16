"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'

type Vehicle = {
    id: number
    name: string
    status: 'active' | 'inactive' | 'maintenance' | 'approved'
    total_bookings: number
    total_revenue: number
    rating: number
}

interface Booking {
    id: number;
    vehicle_name: string;
    customer_name: string;
    total_amount: number;
    start_date: string;
    end_date: string;
    status: string;
}

type DashboardStats = {
    total_vehicles: number
    active_vehicles: number
    total_bookings: number
    total_revenue: number
    average_rating: number
    pending_bookings: number
}

export default function OwnerDashboardPage() {
    const [user, setUser] = useState<User | null>(null)
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [recentBookings, setRecentBookings] = useState<Booking[]>([])
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isOwnerMode, setIsOwnerMode] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [bookings, setBookings] = useState<Booking[]>([])
    const [bookingsLoading, setBookingsLoading] = useState(true)
    const [bookingsError, setBookingsError] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                // Fetch all data in parallel
                const [userRes, vehiclesRes, bookingsRes, statsRes] = await Promise.all([
                    fetch('/api/user/me'),
                    fetch('/api/owner/vehicles'),
                    fetch('/api/bookings/owner'),
                    fetch('/api/owner/stats')
                ])

                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }

                const userData = await userRes.json()
                const currentUser = userData.user

                // Only allow access if user is owner
                if (currentUser.role !== 'owner') {
                    router.push('/dashboard')
                    return
                }

                setUser(currentUser)

                if (vehiclesRes.ok) {
                    const vehiclesData = await vehiclesRes.json()
                    setVehicles(vehiclesData.vehicles)
                }

                if (bookingsRes.ok) {
                    const bookingsData = await bookingsRes.json()
                    setBookings(bookingsData.bookings)
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json()
                    setStats(statsData.stats)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router])

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/bookings/owner')
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings')
                setBookings(data.bookings)
            } catch (err) {
                console.error('Error fetching bookings:', err)
                setBookingsError(err instanceof Error ? err.message : 'Failed to fetch bookings')
            } finally {
                setBookingsLoading(false)
            }
        }
        fetchBookings()
    }, [])

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto p-6">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Mode Toggle */}
            <div className="flex justify-center mt-6 mb-8">
                <button
                    className={`px-4 py-2 rounded-l-full border border-blue-600 text-sm font-medium transition-colors ${!isOwnerMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                    onClick={() => setIsOwnerMode(false)}
                >
                    User Mode
                </button>
                <button
                    className={`px-4 py-2 rounded-r-full border border-blue-600 text-sm font-medium transition-colors ${isOwnerMode ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'}`}
                    onClick={() => setIsOwnerMode(true)}
                >
                    Owner Mode
                </button>
            </div>

            {/* Conditional Dashboard Content */}
            {isOwnerMode ? (
                // --- OWNER DASHBOARD CONTENT ---
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Owner Dashboard</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Your Vehicles */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Your Vehicles</h2>
                                <Link href="/dashboard/owner/vehicles?user=" className="text-blue-600 hover:underline text-sm">View All →</Link>
                            </div>
                            {vehicles.length > 0 ? (
                                <div className="space-y-4">
                                    {vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{vehicle.name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {vehicle.total_bookings} bookings • ${vehicle.total_revenue} revenue
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 text-xs rounded-full ${vehicle.status === 'approved' || vehicle.status === 'active'
                                                    ? 'bg-green-100 text-green-800'
                                                    : vehicle.status === 'maintenance'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {vehicle.status === 'approved' ? 'Active' : capitalizeFirstLetter(vehicle.status)}
                                                </span>
                                            </div>
                                            <div className="mt-2 flex items-center">
                                                <span className="text-yellow-500">⭐</span>
                                                <span className="ml-1 text-sm">{vehicle.rating.toFixed(1)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-600">No vehicles listed yet.</p>
                            )}
                        </div>
                        {/* Recent Bookings */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
                                <Link href="/dashboard/owner/bookings?user=" className="text-blue-600 hover:underline text-sm">View All →</Link>
                            </div>
                            {bookingsLoading ? (
                                <p>Loading bookings...</p>
                            ) : bookingsError ? (
                                <p className="text-red-500">{bookingsError}</p>
                            ) : bookings.length === 0 ? (
                                <p>No bookings found.</p>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map((booking) => (
                                        <div key={booking.id} className="border rounded-lg p-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium">{booking.vehicle_name}</h3>
                                                    <p className="text-sm text-gray-600">
                                                        {booking.customer_name} • ${booking.total_amount}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                                                    </p>
                                                </div>
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
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end mt-6">
                        <Link href="/dashboard/owner/vehicles/new?user=" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add New Vehicle</Link>
                    </div>
                </div>
            ) : (
                // --- USER DASHBOARD CONTENT ---
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">User Dashboard</h1>
                    {/* Welcome Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome back, {user.name}!</h2>
                        <p className="text-gray-600">Browse vehicles, manage your bookings, and update your profile.</p>
                    </div>
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <Link href={`/dashboard/vehicles?user=${searchParams?.get('user')}`} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Browse Vehicles</h2>
                                    <p className="text-gray-600">Find and book your perfect ride</p>
                                </div>
                                <span className="text-2xl">🔍</span>
                            </div>
                        </Link>
                        <Link href="/dashboard/bookings" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h2>
                                    <p className="text-gray-600">View and manage your bookings</p>
                                </div>
                                <span className="text-2xl">📋</span>
                            </div>
                        </Link>
                        <Link href="/dashboard/profile" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Profile</h2>
                                    <p className="text-gray-600">Update your personal information</p>
                                </div>
                                <span className="text-2xl">⚙️</span>
                            </div>
                        </Link>
                    </div>
                    {/* Recent Activity */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="text-gray-900 font-medium">No recent activity</p>
                                    <p className="text-gray-600 text-sm">Your recent bookings will appear here</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 