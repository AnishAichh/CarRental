'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'

interface Vehicle {
    id: number
    name: string
    brand_model: string
    type: string
    price_per_day: number
    location: string
    image_url: string
    is_available: boolean
    owner_name: string
    approved_by_admin: boolean
}

interface SearchParams {
    location: string
    startDate: string
    endDate: string
}

export default function BrowseVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [searchParams, setSearchParams] = useState<SearchParams>({
        location: '',
        startDate: '',
        endDate: ''
    })
    const [hasSearched, setHasSearched] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userRes = await fetch('/api/auth/me')
                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const userData = await userRes.json()
                setUser(userData.user)
            } catch (err) {
                console.error('Error fetching user data:', err)
                setError(err instanceof Error ? err.message : 'An error occurred')
            }
        }

        fetchUserData()
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const queryParams = new URLSearchParams({
                location: searchParams.location,
                startDate: searchParams.startDate,
                endDate: searchParams.endDate
            })

            console.log('Searching with params:', queryParams.toString())
            const vehiclesRes = await fetch(`/api/vehicles?${queryParams.toString()}`)
            if (!vehiclesRes.ok) {
                throw new Error('Failed to fetch vehicles')
            }
            const vehiclesData = await vehiclesRes.json()
            console.log('Received vehicles:', vehiclesData.vehicles)
            setVehicles(vehiclesData.vehicles)
            setHasSearched(true)
        } catch (err) {
            console.error('Error fetching vehicles:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
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

        const queryParams = new URLSearchParams({
            user: user.id.toString(),
            startDate: searchParams.startDate,
            endDate: searchParams.endDate
        })
        router.push(`/vehicles/${vehicleId}/book?${queryParams.toString()}`)
    }

    return (
        <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Find Available Vehicles</h1>

                <form onSubmit={handleSearch} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            <input
                                type="text"
                                id="location"
                                value={searchParams.location}
                                onChange={(e) => setSearchParams(prev => ({ ...prev, location: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                placeholder="Enter city or area"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={searchParams.startDate}
                                onChange={(e) => setSearchParams(prev => ({ ...prev, startDate: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={searchParams.endDate}
                                onChange={(e) => setSearchParams(prev => ({ ...prev, endDate: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                min={searchParams.startDate || new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full md:w-auto px-6 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                    >
                        {loading ? 'Searching...' : 'Search Vehicles'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {hasSearched && (
                    <>
                        {loading ? (
                            <div className="animate-pulse">
                                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-64 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-600">No vehicles available for the selected criteria.</p>
                            </div>
                        ) : (
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
                        )}
                    </>
                )}
            </div>
        </div>
    )
} 