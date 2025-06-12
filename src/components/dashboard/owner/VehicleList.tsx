'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Vehicle {
    id: number
    name: string
    model: string
    year: number
    price_per_day: number
    status: string
    image_url: string
    is_available: boolean
}

interface VehicleListProps {
    vehicles: Vehicle[]
    onAvailabilityRequest: (vehicleId: number) => void
}

export default function VehicleList({ vehicles, onAvailabilityRequest }: VehicleListProps) {
    const [expandedVehicle, setExpandedVehicle] = useState<number | null>(null)

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved':
                return 'bg-green-100 text-green-800'
            case 'pending_approval':
                return 'bg-yellow-100 text-yellow-800'
            case 'rejected':
                return 'bg-red-100 text-red-800'
            case 'pending_physical_verification':
                return 'bg-blue-100 text-blue-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatStatus = (status: string) => {
        return status.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')
    }

    return (
        <div className="divide-y">
            {vehicles.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                    No vehicles listed yet. Add your first vehicle to get started!
                </div>
            ) : (
                vehicles.map((vehicle) => (
                    <div
                        key={vehicle.id}
                        className="p-6 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="relative h-20 w-32">
                                    <Image
                                        src={vehicle.image_url || '/placeholder-car.jpg'}
                                        alt={vehicle.name}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                                    <p className="text-gray-600">{vehicle.model} • {vehicle.year}</p>
                                    <p className="text-primary font-semibold">
                                        ${vehicle.price_per_day}/day
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(vehicle.status)}`}>
                                    {formatStatus(vehicle.status)}
                                </span>
                                <button
                                    onClick={() => setExpandedVehicle(
                                        expandedVehicle === vehicle.id ? null : vehicle.id
                                    )}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {expandedVehicle === vehicle.id ? (
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

                        {expandedVehicle === vehicle.id && (
                            <div className="mt-4 pt-4 border-t">
                                <div className="flex justify-end space-x-4">
                                    {!vehicle.is_available && vehicle.status === 'approved' && (
                                        <button
                                            onClick={() => onAvailabilityRequest(vehicle.id)}
                                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                                        >
                                            Request Availability
                                        </button>
                                    )}
                                    <button
                                        onClick={() => window.location.href = `/dashboard/owner/vehicles/${vehicle.id}`}
                                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    )
} 