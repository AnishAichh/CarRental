'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

type Vehicle = {
    id: number
    name: string
    model: string
    year: number
    price_per_day: number
    status: string
    image_url: string
    is_available: boolean
    total_bookings: number
    total_revenue: number
    rating: number
}

type User = {
    id: number
    name: string
    email: string
    role: string
}

export default function OwnerVehiclesPage() {
    const [user, setUser] = useState<User | null>(null)
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const searchParams = useSearchParams()
    const [loadingId, setLoadingId] = useState<number | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                const userId = searchParams?.get('user')
                if (!userId) {
                    router.push('/dashboard')
                    return
                }

                // Fetch user data and vehicles in parallel
                const [userRes, vehiclesRes] = await Promise.all([
                    fetch('/api/user/me'),
                    fetch('/api/owner/vehicles')
                ])

                if (!userRes.ok) {
                    throw new Error('Failed to fetch user data')
                }

                const userData = await userRes.json()
                const currentUser = userData.user

                // Verify that the current user is accessing their own vehicles and is an owner
                if (currentUser.id.toString() !== userId || currentUser.role !== 'owner') {
                    router.push('/dashboard')
                    return
                }

                setUser(currentUser)

                if (vehiclesRes.ok) {
                    const vehiclesData = await vehiclesRes.json()
                    setVehicles(vehiclesData.vehicles)
                } else {
                    throw new Error('Failed to fetch vehicles')
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred')
                console.error('Error fetching data:', err)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [router, searchParams])

    const handleToggleAvailability = async (vehicle: Vehicle) => {
        setLoadingId(vehicle.id)
        try {
            const res = await fetch(`/api/owner/vehicles/${vehicle.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ availability: !vehicle.is_available })
            })
            if (res.ok) {
                setVehicles(prev => prev.map(v =>
                    v.id === vehicle.id ? { ...v, is_available: !vehicle.is_available } : v
                ))
            } else {
                alert('Failed to update availability')
            }
        } catch (e) {
            alert('Error updating availability')
        } finally {
            setLoadingId(null)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Your Vehicles</h1>
                <Link
                    href={`/dashboard/owner/vehicles/new?user=${user.id}`}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add New Vehicle
                </Link>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {vehicles.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-6 text-center">
                    <p className="text-gray-600 mb-4">No vehicles listed yet.</p>
                    <Link
                        href={`/dashboard/owner/vehicles/new?user=${user.id}`}
                        className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Your First Vehicle
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle) => (
                        <div key={vehicle.id} className="bg-white shadow rounded-lg overflow-hidden">
                            <div className="relative h-48">
                                <Image
                                    src={vehicle.image_url || '/placeholder-car.jpg'}
                                    alt={vehicle.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                                        <p className="text-gray-600">{vehicle.model} • {vehicle.year}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs rounded-full ${vehicle.status === 'approved'
                                        ? 'bg-green-100 text-green-800'
                                        : vehicle.status === 'pending_approval'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                        }`}>
                                        {vehicle.status.split('_').map(word =>
                                            word.charAt(0).toUpperCase() + word.slice(1)
                                        ).join(' ')}
                                    </span>
                                </div>
                                <p className="text-lg font-semibold text-blue-600 mb-2">
                                    ${vehicle.price_per_day}/day
                                </p>
                                <div className="flex justify-between text-sm text-gray-600 mb-4">
                                    <span>{vehicle.total_bookings} bookings</span>
                                    <span>${vehicle.total_revenue} revenue</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <span className="text-yellow-500">⭐</span>
                                        <span className="ml-1">{vehicle.rating.toFixed(1)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {vehicle.status === 'approved' && (
                                            <button
                                                className={`px-3 py-1 rounded text-sm border ${vehicle.is_available ? 'bg-green-100 border-green-400 text-green-800' : 'bg-red-100 border-red-400 text-red-800'} ${loadingId === vehicle.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                onClick={() => handleToggleAvailability(vehicle)}
                                                disabled={loadingId === vehicle.id}
                                            >
                                                {vehicle.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                            </button>
                                        )}
                                        <Link
                                            href={`/dashboard/owner/vehicles/${vehicle.id}?user=${user.id}`}
                                            className="text-blue-600 hover:text-blue-800 ml-2"
                                        >
                                            View Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 