'use client'

import { useEffect, useState } from 'react'

interface Vehicle {
    id: string
    name: string
    brand: string
    model: string
    registration_number: string
    owner_name: string
    owner_email: string
    status: string
}

export default function ViewApprovedVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchApprovedVehicles()
    }, [])

    const fetchApprovedVehicles = async () => {
        setLoading(true)
        const response = await fetch('/api/admin/vehicles/approved', { credentials: 'include' })
        if (response.ok) {
            setVehicles(await response.json())
        } else {
            setVehicles([])
        }
        setLoading(false)
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Approved Vehicles</h1>
            {vehicles.length === 0 ? (
                <div>No approved vehicles found</div>
            ) : (
                <div className="grid gap-6">
                    {vehicles.map(vehicle => (
                        <div key={vehicle.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div>
                                <h2 className="text-xl font-semibold mb-2">{vehicle.brand} {vehicle.model}</h2>
                                <p>Vehicle Name: {vehicle.name}</p>
                                <p>Registration: {vehicle.registration_number}</p>
                                <p>Owner: {vehicle.owner_name} ({vehicle.owner_email})</p>
                                <p>Status: <span className="font-semibold text-green-600">{vehicle.status}</span></p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 