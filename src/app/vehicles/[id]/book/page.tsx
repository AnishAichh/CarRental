'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import { User } from '@/lib/types'

interface Vehicle {
    id: number
    name: string
    brand_model: string
    type: string
    price_per_day: number
    location: string
    image_url: string
    owner_name: string
}

export default function BookVehiclePage({ params }: { params: { id: string } }) {
    const { id } = useParams() as { id: string };
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [totalDays, setTotalDays] = useState(0)
    const [totalAmount, setTotalAmount] = useState(0)
    const [bookingOption, setBookingOption] = useState<'without_driver' | 'with_driver' | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [bookingDetails, setBookingDetails] = useState<any>(null);

    console.log('BookVehiclePage: params id', id)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userRes = await fetch('/api/auth/me')
                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const userData = await userRes.json()
                setUser(userData.user)

                // Fetch vehicle data
                const vehicleRes = await fetch(`/api/vehicles/${id}`)
                if (!vehicleRes.ok) {
                    throw new Error('Failed to fetch vehicle data')
                }
                const vehicleData = await vehicleRes.json()
                console.log('BookVehiclePage: Fetched vehicle data', vehicleData)
                setVehicle(vehicleData)
            } catch (err) {
                console.error('BookVehiclePage: Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [id])

    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
            setTotalDays(days)
            if (vehicle) {
                setTotalAmount(days * vehicle.price_per_day)
            }
        }
    }, [startDate, endDate, vehicle])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user || !vehicle || !bookingOption) {
            setError('Please select a booking option.')
            return
        }

        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    vehicle_id: vehicle.id,
                    start_date: startDate,
                    end_date: endDate,
                    total_amount: totalAmount,
                    booking_option: bookingOption,
                }),
            })

            if (!res.ok) {
                throw new Error('Failed to create booking')
            }

            // Instead of redirect, show confirmation dialog
            const booking = await res.json();
            setBookingDetails({
                ...booking,
                vehicle,
                startDate,
                endDate,
                totalAmount,
            });
            setShowConfirmation(true);

            // Update booking status to 'confirmed'
            await fetch('/api/admin/bookings/' + booking.id + '/notify', {
                method: 'POST',
            })

            // Insert notification
            await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: booking.user_id,
                    title: 'Booking Confirmed!',
                    message: `Your booking for ${booking.vehicle_name} is confirmed! Pickup Info: ${booking.location}, ${booking.time}. ${booking.notes || ''}`,
                }),
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create booking')
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

    if (!vehicle) {
        console.log('BookVehiclePage: Vehicle is null/undefined during render', vehicle)
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                Vehicle not found
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Vehicle</h1>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Vehicle Details */}
                    <div className="md:w-1/2">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-200 rounded-lg overflow-hidden">
                            {vehicle.image_url && (
                                <img
                                    src={vehicle.image_url}
                                    alt={vehicle.name}
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="mt-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {vehicle.name || vehicle.brand_model}
                            </h2>
                            <p className="text-gray-600 mt-1">
                                {vehicle.type} • {vehicle.location}
                            </p>
                            <p className="text-gray-900 font-medium mt-2">
                                ${vehicle.price_per_day}/day
                            </p>
                            <p className="text-gray-600 text-sm mt-1">
                                Owner: {vehicle.owner_name}
                            </p>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="md:w-1/2">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="startDate"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="endDate"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    required
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>

                            {/* New: Driver Option Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Booking Option
                                </label>
                                <div className="flex items-center space-x-4">
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-600"
                                            name="bookingOption"
                                            value="without_driver"
                                            checked={bookingOption === 'without_driver'}
                                            onChange={() => setBookingOption('without_driver')}
                                            required
                                        />
                                        <span className="ml-2 text-gray-700">Without Driver</span>
                                    </label>
                                    <label className="inline-flex items-center">
                                        <input
                                            type="radio"
                                            className="form-radio text-blue-600"
                                            name="bookingOption"
                                            value="with_driver"
                                            checked={bookingOption === 'with_driver'}
                                            onChange={() => setBookingOption('with_driver')}
                                            required
                                        />
                                        <span className="ml-2 text-gray-700">With Driver</span>
                                    </label>
                                </div>
                            </div>

                            {totalDays > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between text-sm text-gray-600">
                                        <span>Number of days:</span>
                                        <span>{totalDays}</span>
                                    </div>
                                    <div className="flex justify-between font-medium text-gray-900 mt-2">
                                        <span>Total amount:</span>
                                        <span>${totalAmount}</span>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={!startDate || !endDate || !bookingOption}
                                className={`w-full px-4 py-2 rounded ${startDate && endDate && bookingOption
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                Book Now
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmation && bookingDetails && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h2 className="text-2xl font-bold mb-4 text-green-700">Booking Confirmed!</h2>
                        <div className="mb-4">
                            <img src={bookingDetails.vehicle.image_url} alt={bookingDetails.vehicle.name} className="w-full h-40 object-cover rounded mb-2" />
                            <div className="font-semibold">{bookingDetails.vehicle.name}</div>
                            <div className="text-gray-600">{bookingDetails.vehicle.location}</div>
                        </div>
                        <div className="mb-2">Dates: <span className="font-medium">{bookingDetails.startDate} to {bookingDetails.endDate}</span></div>
                        <div className="mb-2">Total Price: <span className="font-medium">${bookingDetails.totalAmount}</span></div>
                        <div className="mb-2">Pickup Info: <span className="font-medium">Pending (You will receive details soon)</span></div>
                        <div className="mb-4 text-green-700">Thank you for booking with us! You will receive pickup instructions via email or notification soon.</div>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                            onClick={() => router.push(`/dashboard/user/bookings?user=${user?.id}`)}
                        >
                            Go to My Bookings
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
} 