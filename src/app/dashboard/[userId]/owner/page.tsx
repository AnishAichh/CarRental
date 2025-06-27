"use client";

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface Vehicle {
    id: number;
    name: string;
    price_per_day: number;
    location: string;
}

interface Booking {
    id: number;
    vehicle_name: string;
    user_name: string;
    start_date: string;
    end_date: string;
    status: string;
    total_amount: number;
}

const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

export default function OwnerDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [bookings, setBookings] = useState<Booking[]>([])
    const [earnings, setEarnings] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<Response> => {
        try {
            const response = await fetch(url)
            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
            }
            return response
        } catch (error) {
            if (retries > 0) {
                console.log(`Retrying ${url}. Attempts left: ${retries - 1}`)
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
                return fetchWithRetry(url, retries - 1)
            }
            throw error
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const [vehiclesRes, bookingsRes, earningsRes] = await Promise.all([
                    fetchWithRetry('/api/owner/vehicles'),
                    fetchWithRetry('/api/bookings/owner'),
                    fetchWithRetry('/api/owner/earnings')
                ])

                const vehiclesData = await vehiclesRes.json()
                const bookingsData = await bookingsRes.json()
                const earningsData = await earningsRes.json()

                setVehicles(vehiclesData.vehicles || [])
                setBookings(bookingsData.bookings || [])
                setEarnings(earningsData.earnings || 0)

            } catch (err) {
                console.error('Error fetching dashboard data:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4">Loading dashboard data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Owner Dashboard</h1>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Your Vehicles</h2>
                {vehicles.length === 0 ? (
                    <p>No vehicles found.</p>
                ) : (
                    <div className="grid gap-4">
                        {vehicles.map((vehicle) => (
                            <div key={vehicle.id} className="border p-4 rounded-lg">
                                <p><strong>Name:</strong> {vehicle.name}</p>
                                <p><strong>Price per day:</strong> ${vehicle.price_per_day}</p>
                                <p><strong>Location:</strong> {vehicle.location}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Recent Bookings</h2>
                {bookings.length === 0 ? (
                    <p>No bookings found.</p>
                ) : (
                    <div className="grid gap-4">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="border p-4 rounded-lg">
                                <p><strong>Vehicle:</strong> {booking.vehicle_name}</p>
                                <p><strong>User:</strong> {booking.user_name}</p>
                                <p><strong>Dates:</strong> {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}</p>
                                <p><strong>Status:</strong> {booking.status}</p>
                                <p><strong>Total Amount:</strong> ${booking.total_amount}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Total Earnings</h2>
                <p>${earnings}</p>
            </div>
        </div>
    )
} 