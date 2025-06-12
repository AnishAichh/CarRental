'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Booking {
    id: number
    vehicle_id: number
    user_id: number
    start_date: string
    end_date: string
    status: string
    total_amount: number
    vehicle: {
        name: string
        model: string
        image_url: string
    }
    user: {
        name: string
        email: string
        phone: string
    }
}

interface BookingRequestsProps {
    bookings: Booking[]
    onStatusUpdate: () => void
}

export default function BookingRequests({ bookings, onStatusUpdate }: BookingRequestsProps) {
    const [expandedBooking, setExpandedBooking] = useState<number | null>(null)
    const [isUpdating, setIsUpdating] = useState<number | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'pending':
                return 'bg-yellow-100 text-yellow-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            case 'completed':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
        setIsUpdating(bookingId)
        try {
            const response = await fetch(`/api/owner/bookings/${bookingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) {
                throw new Error('Failed to update booking status')
            }

            onStatusUpdate()
        } catch (error) {
            console.error('Error updating booking status:', error)
        } finally {
            setIsUpdating(null)
        }
    }

    return (
        <div className="divide-y">
            {bookings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    No booking requests yet.
                </div>
            ) : (
                bookings.map((booking) => (
                    <div
                        key={booking.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative h-20 w-32">
                                    <Image
                                        src={booking.vehicle.image_url || '/placeholder-car.jpg'}
                                        alt={booking.vehicle.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{booking.vehicle.name}</h3>
                                    <p className="text-gray-600">{booking.vehicle.model}</p>
                                    <p className="text-primary font-semibold">
                                        ${booking.total_amount}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(booking.status)}`}>
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                                <button
                                    onClick={() => setExpandedBooking(
                                        expandedBooking === booking.id ? null : booking.id
                                    )}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {expandedBooking === booking.id ? (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {expandedBooking === booking.id && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Booking Details</h4>
                                        <p>Start Date: {formatDate(booking.start_date)}</p>
                                        <p>End Date: {formatDate(booking.end_date)}</p>
                                        <p>Total Amount: ${booking.total_amount}</p>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Customer Details</h4>
                                        <p>Name: {booking.user.name}</p>
                                        <p>Email: {booking.user.email}</p>
                                        <p>Phone: {booking.user.phone}</p>
                                    </div>
                                </div>

                                {booking.status === 'pending' && (
                                    <div className="mt-4 flex justify-end space-x-4">
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                            disabled={isUpdating === booking.id}
                                            className="bg-red-100 text-red-700 px-4 py-2 rounded hover:bg-red-200 disabled:opacity-50"
                                        >
                                            {isUpdating === booking.id ? 'Updating...' : 'Reject'}
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                            disabled={isUpdating === booking.id}
                                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            {isUpdating === booking.id ? 'Updating...' : 'Confirm'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
} 