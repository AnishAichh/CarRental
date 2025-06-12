'use client'
import { useEffect, useState } from 'react'

type Booking = {
    id: number
    vehicle_name: string
    image_url: string
    start_date: string
    end_date: string
    total_price: number
    platform_fee: number
    status: string
}

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {
        fetch('/api/bookings')
            .then(res => res.json())
            .then(setBookings)
    }, [])

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">My Bookings</h2>
            <div className="space-y-6">
                {bookings.map((b) => (
                    <div key={b.id} className="border p-4 rounded shadow space-y-2">
                        <img src={b.image_url} alt={b.vehicle_name} className="h-32 w-full object-cover rounded" />
                        <h3 className="text-xl font-semibold">{b.vehicle_name}</h3>
                        <p><strong>From:</strong> {b.start_date} <strong>To:</strong> {b.end_date}</p>
                        <p><strong>Total:</strong> ₹{b.total_price} (<span className="text-sm text-gray-500">Platform Fee: ₹{b.platform_fee}</span>)</p>
                        <p>Status: <span className="font-semibold">{b.status}</span></p>
                    </div>
                ))}
            </div>
        </div>
    )
}
