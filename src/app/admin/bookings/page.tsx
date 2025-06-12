'use client'

import { useEffect, useState } from 'react'

type Booking = {
    id: number
    vehicle_name: string
    renter_email: string
    start_date: string
    end_date: string
    total_price: number
    platform_fee: number
    status: string
}

export default function AdminBookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([])

    useEffect(() => {
        fetch('/api/admin/bookings')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setBookings(data)
                } else {
                    console.error('Expected array, got:', data)
                }
            })
    }, [])

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">All Bookings</h2>
            <table className="w-full border-collapse border">
                <thead className="bg-gray-100 text-left">
                    <tr>
                        <th className="p-2 border">Vehicle</th>
                        <th className="p-2 border">Renter</th>
                        <th className="p-2 border">From</th>
                        <th className="p-2 border">To</th>
                        <th className="p-2 border">Total ₹</th>
                        <th className="p-2 border">Platform Fee ₹</th>
                        <th className="p-2 border">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.map((b) => (
                        <tr key={b.id} className="border-t">
                            <td className="p-2 border">{b.vehicle_name}</td>
                            <td className="p-2 border">{b.renter_email}</td>
                            <td className="p-2 border">{b.start_date}</td>
                            <td className="p-2 border">{b.end_date}</td>
                            <td className="p-2 border">₹{b.total_price}</td>
                            <td className="p-2 border">₹{b.platform_fee}</td>
                            <td className="p-2 border">{b.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}