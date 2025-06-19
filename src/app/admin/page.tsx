'use client'

import { useRouter } from 'next/navigation'

export default function AdminHomePage() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold mb-4 text-center">Vheego Admin Dashboard</h1>
                <p className="mb-6 text-center text-gray-600">Manage everything from one place</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                        onClick={() => router.push('/admin/kyc')}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow"
                    >
                        🔎 Review KYC
                    </button>
                    <button
                        onClick={() => router.push('/admin/bookings')}
                        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg shadow"
                    >
                        📅 View Bookings
                    </button>
                    <button
                        onClick={() => router.push('/admin/vehicles')}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg shadow"
                    >
                        🚗 Manage Vehicles
                    </button>
                    <button
                        onClick={() => router.push('/admin/add-vehicle')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white p-4 rounded-lg shadow"
                    >
                        ➕ Add Vehicle
                    </button>
                    <button
                        onClick={() => router.push('/admin/transactions')}
                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-lg shadow"
                    >
                        💰 View Transactions
                    </button>
                </div>
            </div>
        </main>
    )
}