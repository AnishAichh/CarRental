'use client'

import { useEffect, useState } from 'react'

type Vehicle = {
    id: number
    name: string
    brand: string
    type: string
    price_per_day: number
    image_url: string
    approved: boolean
    availability: boolean
}

export default function AdminVehicleApproval() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])

    useEffect(() => {
        fetch('/api/admin/vehicles')
            .then(res => res.json())
            .then(data => setVehicles(data))
    }, [])

    const updateStatus = async (id: number, approve: boolean) => {
        const res = await fetch(`/api/admin/vehicles/${id}/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: approve ? 'approve' : 'reject',
                notes: approve ? 'Vehicle approved by admin' : 'Vehicle rejected by admin'
            })
        })

        if (res.ok) {
            alert(`Vehicle ${approve ? 'approved' : 'rejected'}`)
            setVehicles(prev => prev.filter((v) => v.id !== id))
        } else {
            const data = await res.json()
            alert(data.error || 'Failed to update vehicle status')
        }
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-4">Pending Vehicle Listings</h2>
            <div className="space-y-6">
                {vehicles.map((v) => (
                    <div key={v.id} className="border p-4 rounded shadow space-y-2">
                        <img src={v.image_url} alt={v.name} className="h-40 w-full object-cover rounded" />
                        <h3 className="text-xl font-semibold">{v.name}</h3>
                        <p>Type: {v.type} | Brand: {v.brand} | ₹{v.price_per_day}/day</p>
                        <div className="flex gap-4 mt-3">
                            <button
                                onClick={() => updateStatus(v.id, true)}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => updateStatus(v.id, false)}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
