'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import VehicleList from './VehicleList'
import BookingRequests from './BookingRequests'
import RevenueStats from './RevenueStats'
import AddVehicleModal from './AddVehicleModal'

export default function OwnerDashboard() {
    const [vehicles, setVehicles] = useState([])
    const [bookings, setBookings] = useState([])
    const [stats, setStats] = useState({
        total_revenue: 0,
        active_bookings: 0,
        pending_requests: 0
    })
    const [isAddVehicleModalOpen, setIsAddVehicleModalOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [vehiclesRes, bookingsRes] = await Promise.all([
                fetch('/api/owner/vehicles'),
                fetch('/api/owner/bookings')
            ])

            if (!vehiclesRes.ok || !bookingsRes.ok) {
                throw new Error('Failed to fetch dashboard data')
            }

            const [vehiclesData, bookingsData] = await Promise.all([
                vehiclesRes.json(),
                bookingsRes.json()
            ])

            setVehicles(vehiclesData.vehicles)
            setBookings(bookingsData.bookings)
            setStats(bookingsData.stats)
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddVehicle = async (vehicleData: any) => {
        try {
            const response = await fetch('/api/vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vehicleData)
            })

            if (!response.ok) {
                throw new Error('Failed to add vehicle')
            }

            setIsAddVehicleModalOpen(false)
            fetchDashboardData()
        } catch (error) {
            console.error('Error adding vehicle:', error)
        }
    }

    const handleAvailabilityRequest = async (vehicleId: number) => {
        try {
            const response = await fetch('/api/vehicles/availability-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ vehicle_id: vehicleId })
            })

            if (!response.ok) {
                throw new Error('Failed to request availability')
            }

            fetchDashboardData()
        } catch (error) {
            console.error('Error requesting availability:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Total Revenue</h3>
                    <p className="text-2xl font-bold text-primary">${stats.total_revenue}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Active Bookings</h3>
                    <p className="text-2xl font-bold text-primary">{stats.active_bookings}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-600">Pending Requests</h3>
                    <p className="text-2xl font-bold text-primary">{stats.pending_requests}</p>
                </div>
            </div>

            {/* Vehicle Management */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">Your Vehicles</h2>
                        <button
                            onClick={() => setIsAddVehicleModalOpen(true)}
                            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                        >
                            Add Vehicle
                        </button>
                    </div>
                </div>
                <VehicleList
                    vehicles={vehicles}
                    onAvailabilityRequest={handleAvailabilityRequest}
                />
            </div>

            {/* Booking Requests */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold">Booking Requests</h2>
                </div>
                <BookingRequests
                    bookings={bookings}
                    onStatusUpdate={fetchDashboardData}
                />
            </div>

            {/* Add Vehicle Modal */}
            <AddVehicleModal
                isOpen={isAddVehicleModalOpen}
                onClose={() => setIsAddVehicleModalOpen(false)}
                onSubmit={handleAddVehicle}
            />
        </div>
    )
} 