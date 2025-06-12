'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type Vehicle = {
    id: number
    name: string
    brand: string
    type: string
    price_per_day: number
    image_url: string
    availability: boolean
}

export default function VehicleListPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch('/api/vehicles')

                if (!res.ok) {
                    throw new Error('Failed to fetch vehicles')
                }

                const data = await res.json()
                if (data.vehicles && Array.isArray(data.vehicles)) {
                    setVehicles(data.vehicles)
                } else {
                    throw new Error('Invalid response format')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load vehicles')
                console.error('Error fetching vehicles:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchVehicles()
    }, [])

    const handleVehicleClick = (vehicleId: number) => {
        router.push(`/vehicles/${vehicleId}`)
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6">Available Vehicles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="border rounded p-4 shadow animate-pulse">
                            <div className="h-40 bg-gray-200 rounded mb-2"></div>
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-blue-600 hover:underline"
                    >
                        Try again
                    </button>
                </div>
            </div>
        )
    }

    if (vehicles.length === 0) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <h2 className="text-3xl font-bold mb-6">Available Vehicles</h2>
                <p className="text-gray-600">No vehicles available at the moment.</p>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold mb-6">Available Vehicles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {vehicles.map(vehicle => (
                    <div key={vehicle.id} className="border rounded p-4 shadow hover:shadow-lg transition">
                        <img
                            src={vehicle.image_url}
                            alt={vehicle.name}
                            className="h-40 w-full object-cover rounded mb-2"
                        />
                        <h3 className="text-xl font-semibold">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600">{vehicle.brand} • {vehicle.type}</p>
                        <p className="font-bold text-blue-600">₹{vehicle.price_per_day}/day</p>
                        <button
                            onClick={() => handleVehicleClick(vehicle.id)}
                            className="w-full bg-blue-600 text-white text-center py-2 mt-3 rounded hover:bg-blue-700 transition-colors"
                        >
                            View & Book
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
