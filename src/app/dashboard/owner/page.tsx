"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'
import { BellIcon } from '@heroicons/react/24/outline';
import Confetti from 'react-confetti';

type Vehicle = {
    id: number
    name: string
    status: 'active' | 'inactive' | 'maintenance' | 'approved'
    total_bookings: number
    total_revenue: number
    rating: number
    is_available: boolean
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
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [toggleLoadingId, setToggleLoadingId] = useState<number | null>(null)

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

    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await fetch('/api/user/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } finally {
            setNotifLoading(false);
        }
    };

    const handleBellClick = () => {
        setShowNotifications(true);
        fetchNotifications();
    };

    const handleNotifClick = (notif: any) => {
        setSelectedNotif(notif);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

    const handleToggleAvailability = async (vehicleId: number, currentAvailable: boolean) => {
        setToggleLoadingId(vehicleId)
        try {
            const res = await fetch(`/api/owner/vehicles/${vehicleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ availability: !currentAvailable })
            })
            if (res.ok) {
                setVehicles(prev => prev.map(v =>
                    v.id === vehicleId ? { ...v, is_available: !currentAvailable } : v
                ))
            } else {
                alert('Failed to update availability')
            }
        } catch (e) {
            alert('Error updating availability')
        } finally {
            setToggleLoadingId(null)
        }
    }

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            {/* Notification Bell and Modal for User Mode */}
            {!isOwnerMode && (
                <>
                    <button
                        className="absolute top-4 right-4 z-20"
                        onClick={handleBellClick}
                        aria-label="Notifications"
                    >
                        <BellIcon className="h-8 w-8 text-blue-600" />
                        {notifications.some(n => !n.is_read) && (
                            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white"></span>
                        )}
                    </button>

                    {/* Notification Modal */}
                    {showNotifications && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                                <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowNotifications(false)}>&times;</button>
                                <h3 className="text-lg font-bold mb-4 text-black">Notifications</h3>
                                {notifLoading ? (
                                    <div>Loading...</div>
                                ) : notifications.length === 0 ? (
                                    <div className="text-gray-600">No notifications yet.</div>
                                ) : (
                                    <ul className="divide-y">
                                        {notifications.map((notif) => (
                                            <li
                                                key={notif.id}
                                                className="py-3 cursor-pointer hover:bg-blue-50 rounded"
                                                onClick={() => handleNotifClick(notif)}
                                            >
                                                <div className="font-semibold text-black">{notif.title}</div>
                                                <div className="text-gray-700 text-sm">{notif.message.slice(0, 60)}...</div>
                                                <div className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notification Details Modal with Confetti */}
                    {selectedNotif && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                                <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelectedNotif(null)}>&times;</button>
                                {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
                                <h2 className="text-2xl font-bold mb-4 text-green-700">🎉 Booking Confirmed!</h2>
                                <div className="mb-2 font-semibold text-black">{selectedNotif.title}</div>
                                <div className="mb-4 text-gray-800 whitespace-pre-line">{selectedNotif.message}</div>
                                <button
                                    className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                                    onClick={() => setSelectedNotif(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

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
                                <Link href={user ? `/dashboard/owner/vehicles?user=${user.id}` : '#'} className="text-blue-600 hover:underline text-sm">View All →</Link>
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
                                            <div className="mt-2 flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <span className="text-yellow-500">⭐</span>
                                                    <span className="ml-1 text-sm">{vehicle.rating.toFixed(1)}</span>
                                                </div>
                                                {(vehicle.status === 'approved' || vehicle.status === 'active') && (
                                                    <button
                                                        className={`px-3 py-1 rounded text-sm border ${vehicle.is_available ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'} ${toggleLoadingId === vehicle.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        onClick={() => handleToggleAvailability(vehicle.id, vehicle.is_available)}
                                                        disabled={toggleLoadingId === vehicle.id}
                                                    >
                                                        {vehicle.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                                    </button>
                                                )}
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