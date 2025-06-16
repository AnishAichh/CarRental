'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { User } from '@/lib/types'

interface Vehicle {
    id: number
    name: string
    brand_model: string
    type: string
    price_per_day: number
    location: string
    image_url: string
    is_available: boolean // This refers to general listing availability, not date-specific
    owner_name: string
    approved_by_admin: boolean
}

export default function BrowseVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false) // Set to false initially, as no search has been performed
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [searchLocation, setSearchLocation] = useState('')
    const [searchStartDate, setSearchStartDate] = useState('')
    const [searchEndDate, setSearchEndDate] = useState('')
    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await fetch('/api/auth/me')
                if (userRes.ok) {
                    const userData = await userRes.json()
                    setUser(userData.user)
                }
            } catch (err) {
                console.error('Error fetching user data:', err)
            }
        }
        fetchUserData()
    }, [])

    const handleSearch = async () => {
        if (!searchLocation || !searchStartDate || !searchEndDate) {
            setError('Please enter location, start date, and end date to search for vehicles.')
            setVehicles([])
            return
        }

        setLoading(true)
        setError(null)
        try {
            const queryParams = new URLSearchParams({
                location: searchLocation,
                startDate: searchStartDate,
                endDate: searchEndDate,
            }).toString()
            const vehiclesRes = await fetch(`/api/vehicles?${queryParams}`)
            if (!vehiclesRes.ok) {
                throw new Error('Failed to fetch vehicles')
            }
            const vehiclesData = await vehiclesRes.json()
            setVehicles(vehiclesData.vehicles)
        } catch (err) {
            console.error('Error fetching vehicles:', err)
            setError(err instanceof Error ? err.message : 'An error occurred while searching for vehicles')
        } finally {
            setLoading(false)
        }
    }

    const handleBookNow = (vehicleId: number) => {
        if (!user) {
            router.push('/login')
            return
        }

        if (!user.kycVerified) {
            router.push(`/dashboard/kyc?user=${user.id}&redirect=/browse-vehicles`)
            return
        }

        router.push(`/vehicles/${vehicleId}/book?user=${user.id}`)
    }

    const today = new Date().toISOString().split('T')[0]
    const minEndDate = searchStartDate || today

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Find Your Perfect Ride</h1>

                {/* Search Form */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 items-end">
                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            id="location"
                            value={searchLocation}
                            onChange={(e) => setSearchLocation(e.target.value)}
                            placeholder="Enter a location"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            id="startDate"
                            value={searchStartDate}
                            onChange={(e) => setSearchStartDate(e.target.value)}
                            min={today}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            id="endDate"
                            value={searchEndDate}
                            onChange={(e) => setSearchEndDate(e.target.value)}
                            min={minEndDate}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Search Vehicles
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                ) : vehicles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                    {vehicle.image_url && (
                                        <img
                                            src={vehicle.image_url}
                                            alt={vehicle.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {vehicle.name || vehicle.brand_model}
                                    </h3>
                                    <p className="text-gray-600 text-sm mt-1">
                                        {vehicle.type} • {vehicle.location}
                                    </p>
                                    <p className="text-gray-900 font-medium mt-2">
                                        ${vehicle.price_per_day}/day
                                    </p>
                                    <p className="text-gray-600 text-sm mt-1">
                                        Owner: {vehicle.owner_name}
                                    </p>
                                    <button
                                        onClick={() => handleBookNow(vehicle.id)}
                                        disabled={!vehicle.approved_by_admin}
                                        className={`mt-4 w-full px-4 py-2 rounded ${vehicle.approved_by_admin
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                    >
                                        {vehicle.approved_by_admin ? 'Book Now' : 'Not Available'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Enter your desired location and dates to find available vehicles.</p>
                    </div>
                )}
            </div>
        </div>
    )
} 