'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

type Vehicle = {
    id: number
    name: string
    brand: string
    type: string
    price_per_day: number
    image_url: string
    availability: boolean
}

type User = {
    id: number
    email: string
    is_admin: boolean
    is_kyc_verified: boolean
    kyc_status: string
    kyc_created_at: string
}

export default function VehicleDetailPage() {
    const [vehicle, setVehicle] = useState<Vehicle | null>(null)
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const params = useParams()!

    const vehicleId = Array.isArray(params.id) ? params.id[0] : params.id

    useEffect(() => {
        if (!vehicleId) return

        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                // Fetch vehicle and user data in parallel
                const [vehicleRes, userRes] = await Promise.all([
                    fetch(`/api/vehicles/${vehicleId}`),
                    fetch('/api/user/me', {
                        credentials: 'include', // Important for cookies
                        headers: {
                            'Cache-Control': 'no-cache' // Prevent caching
                        }
                    })
                ])

                if (!vehicleRes.ok) {
                    throw new Error('Failed to fetch vehicle')
                }

                const vehicleData = await vehicleRes.json()
                setVehicle(vehicleData)

                // Handle user data
                if (userRes.status === 401) {
                    setUser(null)
                    setError('Please log in to book this vehicle')
                } else if (!userRes.ok) {
                    console.error('User fetch failed:', await userRes.text())
                    setUser(null)
                    setError('Failed to fetch user data')
                } else {
                    const userData = await userRes.json()
                    setUser(userData.user)

                    // Check KYC status
                    if (!userData.user.kyc_status || userData.user.kyc_status !== 'approved') {
                        setError('You must complete KYC verification before booking')
                    }
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [vehicleId])

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setBookingLoading(true)

        if (!user) {
            setError('Please log in to book this vehicle')
            router.push('/login?redirect=' + encodeURIComponent(`/dashboard/vehicles/${vehicleId}`))
            return
        }

        if (!user.is_kyc_verified || user.kyc_status !== 'approved') {
            setError('You must complete KYC verification before booking')
            router.push('/kyc?redirect=' + encodeURIComponent(`/dashboard/vehicles/${vehicleId}`))
            return
        }

        // Validate dates
        if (!startDate || !endDate) {
            setError('Please select both start and end dates')
            setBookingLoading(false)
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (start < today) {
            setError('Start date cannot be in the past')
            setBookingLoading(false)
            return
        }

        if (end < start) {
            setError('End date must be after start date')
            setBookingLoading(false)
            return
        }

        // Validate date range (e.g., max 30 days)
        const maxDays = 30
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        if (days > maxDays) {
            setError(`Booking duration cannot exceed ${maxDays} days`)
            setBookingLoading(false)
            return
        }

        try {
            const payload = {
                fullName: "John Doe", // Replace with actual fullName
                phoneNumber: "1234567890", // Replace with actual phoneNumber
                drivingLicenseUrl: "https://example.com/driving-license.jpg", // Replace with actual drivingLicenseUrl
                addressProofUrl: "https://example.com/address-proof.jpg", // Replace with actual addressProofUrl
                ownershipDeclaration: "I declare I own this vehicle", // Replace with actual ownershipDeclaration
                // vehicle info
                vehicleType: vehicle?.type,
                brandModel: vehicle?.brand,
                registrationNumber: "12345", // Replace with actual registrationNumber
                yearOfManufacture: "2024", // Replace with actual yearOfManufacture
                fuelType: "Petrol", // Replace with actual fuelType
                transmission: "Manual", // Replace with actual transmission
                seatingCapacity: 5, // Replace with actual seatingCapacity
                vehiclePhotoUrl: vehicle?.image_url, // Replace with actual vehiclePhotoUrl
                insuranceDocumentUrl: "https://example.com/insurance-document.jpg", // Replace with actual insuranceDocumentUrl
                rcDocumentUrl: "https://example.com/rc-document.jpg", // Replace with actual rcDocumentUrl
                pricePerDay: vehicle?.price_per_day, // Replace with actual pricePerDay
                availableFrom: startDate,
                availableTo: endDate
            }

            const res = await fetch('/api/owner-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()

            if (!res.ok) {
                if (data.error === 'Vehicle is already booked for the selected dates') {
                    setError('This vehicle is already booked for your selected dates. Please choose different dates.')
                } else if (data.error === 'KYC verification required to make bookings') {
                    setError('You must complete KYC verification before booking')
                    router.push('/kyc?redirect=' + encodeURIComponent(`/dashboard/vehicles/${vehicleId}`))
                } else {
                    throw new Error(data.error || 'Booking failed')
                }
                return
            }

            alert('Booking requested successfully!')
            router.push('/bookings')
        } catch (err) {
            console.error('Booking error:', err)
            setError(err instanceof Error ? err.message : 'Failed to create booking')
        } finally {
            setBookingLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-60 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                </div>
            </div>
        )
    }

    if (!vehicle) return <p className="p-6">Vehicle not found</p>

    const days = startDate && endDate
        ? (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1
        : 0

    const total = days * vehicle.price_per_day

    return (
        <div className="max-w-4xl mx-auto p-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
                    <span className="block sm:inline">{error}</span>
                    {!user && (
                        <div className="mt-2">
                            <Link
                                href={`/login?redirect=${encodeURIComponent(`/dashboard/vehicles/${vehicleId}`)}`}
                                className="text-blue-600 hover:underline"
                            >
                                Click here to log in
                            </Link>
                        </div>
                    )}
                    {user && !user.is_kyc_verified && (
                        <div className="mt-2">
                            <Link
                                href={`/kyc?redirect=${encodeURIComponent(`/dashboard/vehicles/${vehicleId}`)}`}
                                className="text-blue-600 hover:underline"
                            >
                                Click here to complete KYC
                            </Link>
                        </div>
                    )}
                </div>
            )}

            <img src={vehicle.image_url} alt={vehicle.name} className="w-full h-60 object-cover rounded mb-4" />
            <h2 className="text-3xl font-bold">{vehicle.name}</h2>
            <p className="text-gray-600">{vehicle.brand} • {vehicle.type}</p>
            <p className="text-blue-600 font-bold text-xl">₹{vehicle.price_per_day}/day</p>

            <form onSubmit={handleBooking} className="mt-6 space-y-4 border-t pt-6">
                <h3 className="text-xl font-semibold">Book this vehicle</h3>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            min={startDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                </div>

                {days > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <p className="text-gray-600">Duration: {days} {days === 1 ? 'day' : 'days'}</p>
                        <p className="text-lg font-semibold">Total: ₹{total}</p>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={bookingLoading || !startDate || !endDate}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${bookingLoading || !startDate || !endDate
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {bookingLoading ? 'Processing...' : 'Book Now'}
                </button>
            </form>
        </div>
    )
}
