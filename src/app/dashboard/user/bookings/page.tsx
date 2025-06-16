'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@/lib/types'

interface Booking {
    id: number
    vehicle_name: string
    start_date: string
    end_date: string
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
    total_amount: number
    vehicle_image_url: string
}

export default function UserBookingsPage() {
    const [user, setUser] = useState<User | null>(null)
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')

    useEffect(() => {
        const fetchUserDataAndBookings = async () => {
            try {
                // Fetch user data
                const userRes = await fetch('/api/auth/me')
                if (!userRes.ok) {
                    // If user is not authenticated, redirect to login
                    router.push('/login')
                    return
                }
                const userData = await userRes.json()
                setUser(userData.user)

                // Fetch bookings for the authenticated user
                const bookingsRes = await fetch('/api/bookings') // Call the general bookings API
                if (!bookingsRes.ok) {
                    throw new Error('Failed to fetch bookings')
                }
                const bookingsData = await bookingsRes.json()
                setBookings(bookingsData)
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchUserDataAndBookings()
    }, [router])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h1>

                {bookings.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
                        <a
                            href={userId ? `/dashboard/user/browse-vehicles?user=${userId}` : '/'}
                            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Browse Vehicles
                        </a>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {bookings.map((booking) => (
                            <div
                                key={booking.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-4">
                                            <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                                {booking.vehicle_image_url && (
                                                    <img
                                                        src={booking.vehicle_image_url}
                                                        alt={booking.vehicle_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {booking.vehicle_name}
                                                </h3>
                                                <p className="text-gray-600">
                                                    {new Date(booking.start_date).toLocaleDateString()} -{' '}
                                                    {new Date(booking.end_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-gray-900 font-medium mt-1">
                                                    ${booking.total_amount}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                                                    booking.status
                                                )}`}
                                            >
                                                {booking.status.charAt(0).toUpperCase() +
                                                    booking.status.slice(1)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
} 