"use client";

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Booking {
    id: number;
    vehicle_name: string;
    user_name: string;
    start_date: string;
    end_date: string;
    status: string;
    total_amount: number;
}

export default function OwnerBookings() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [bookings, setBookings] = useState<Booking[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const res = await fetch('/api/bookings/owner')
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Failed to fetch bookings')
                setBookings(data.bookings)
            } catch (err) {
                console.error('Error fetching bookings:', err)
                setError(err instanceof Error ? err.message : 'Failed to fetch bookings')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBookings()
    }, [])

    if (isLoading) return <p>Loading...</p>
    if (error) return <p className="text-red-500">{error}</p>

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Owner Bookings</h1>
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
    )
} 