'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

interface Vehicle {
    id: string
    name: string
    brand: string
    model: string
    registration_number: string
    owner: {
        name: string
        email: string
    }
    status: string
    created_at: string
}

export default function ApproveVehiclesPage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchPendingVehicles()
    }, [])

    const fetchPendingVehicles = async () => {
        try {
            const response = await fetch('/api/admin/vehicles/pending')
            if (!response.ok) throw new Error('Failed to fetch vehicles')
            const data = await response.json()
            setVehicles(data)
        } catch (error) {
            console.error('Error fetching vehicles:', error)
            toast.error('Failed to load vehicles')
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (vehicleId: string) => {
        try {
            const response = await fetch(`/api/admin/vehicles/${vehicleId}/approve`, {
                method: 'POST',
            })
            if (!response.ok) throw new Error('Failed to approve vehicle')
            toast.success('Vehicle approved successfully')
            fetchPendingVehicles() // Refresh the list
        } catch (error) {
            console.error('Error approving vehicle:', error)
            toast.error('Failed to approve vehicle')
        }
    }

    const handleReject = async (vehicleId: string) => {
        try {
            const response = await fetch(`/api/admin/vehicles/${vehicleId}/reject`, {
                method: 'POST',
            })
            if (!response.ok) throw new Error('Failed to reject vehicle')
            toast.success('Vehicle rejected successfully')
            fetchPendingVehicles() // Refresh the list
        } catch (error) {
            console.error('Error rejecting vehicle:', error)
            toast.error('Failed to reject vehicle')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Pending Vehicle Approvals</h1>

            {vehicles.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    No pending vehicles to approve
                </div>
            ) : (
                <div className="grid gap-6">
                    {vehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold mb-2">
                                        {vehicle.brand} {vehicle.model}
                                    </h2>
                                    <p className="text-gray-600">Registration: {vehicle.registration_number}</p>
                                    <p className="text-gray-600">Owner: {vehicle.owner.name}</p>
                                    <p className="text-gray-600">Email: {vehicle.owner.email}</p>
                                </div>
                                <div className="flex items-center justify-end space-x-4">
                                    <button
                                        onClick={() => handleReject(vehicle.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleApprove(vehicle.id)}
                                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                    >
                                        Approve
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 