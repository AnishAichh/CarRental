'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function AddVehiclePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [form, setForm] = useState({
        name: '',
        brand: '',
        type: '',
        price_per_day: '',
        image_url: '',
        location: '',
        registration_number: '',
        year_of_manufacture: '',
        fuel_type: '',
        transmission: '',
        seating_capacity: '',
        insurance_document_url: '',
        rc_document_url: '',
        available_from: '',
        available_to: '',
        vehicle_photo_url: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/owner/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to add vehicle')
            }
            alert('Vehicle added successfully!')
            router.push('/dashboard/owner')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add vehicle')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto p-6 bg-white text-black rounded shadow mt-8">
            <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
            <form onSubmit={handleSubmit} className="space-y-4 text-2xl">
                <input name="name" placeholder="Vehicle Name" required className="w-full border p-2" onChange={handleChange} />
                <select name="type" required className="w-full border p-2" onChange={handleChange} value={form.type}>
                    <option value="">Select Type</option>
                    <option value="car">Car</option>
                    <option value="suv">SUV</option>
                    <option value="bike">Bike</option>
                    <option value="van">Van</option>
                </select>
                <select name="brand" required className="w-full border p-2" onChange={handleChange} value={form.brand}>
                    <option value="">Select Brand</option>
                    <option value="maruti">Maruti</option>
                    <option value="toyota">Toyota</option>
                    <option value="honda">Honda</option>
                    <option value="hyundai">Hyundai</option>
                    <option value="tata">Tata</option>
                    <option value="mahindra">Mahindra</option>
                    <option value="ford">Ford</option>
                    <option value="kia">Kia</option>
                    <option value="renault">Renault</option>
                    <option value="other">Other</option>
                </select>
                <input name="price_per_day" type="number" placeholder="Price per Day" required className="w-full border p-2" onChange={handleChange} />
                <input name="image_url" placeholder="Image URL" required className="w-full border p-2" onChange={handleChange} />
                <input name="location" placeholder="Location" required className="w-full border p-2" onChange={handleChange} />
                <input name="registration_number" placeholder="Registration Number" required className="w-full border p-2" onChange={handleChange} />
                <input name="year_of_manufacture" type="number" placeholder="Year of Manufacture" required className="w-full border p-2" onChange={handleChange} />
                <select name="fuel_type" required className="w-full border p-2" onChange={handleChange} value={form.fuel_type}>
                    <option value="">Select Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric</option>
                    <option value="cng">CNG</option>
                    <option value="hybrid">Hybrid</option>
                </select>
                <select name="transmission" required className="w-full border p-2" onChange={handleChange} value={form.transmission}>
                    <option value="">Select Transmission</option>
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                </select>
                <select name="seating_capacity" required className="w-full border p-2" onChange={handleChange} value={form.seating_capacity}>
                    <option value="">Select Seating Capacity</option>
                    <option value="2">2</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                    <option value="7">7</option>
                    <option value="8">8+</option>
                </select>
                <input name="insurance_document_url" placeholder="Insurance Document URL" className="w-full border p-2" onChange={handleChange} />
                <input name="rc_document_url" placeholder="RC Document URL" className="w-full border p-2" onChange={handleChange} />
                <input name="vehicle_photo_url" placeholder="Vehicle Photo URL" className="w-full border p-2" onChange={handleChange} />
                <input name="available_from" type="date" placeholder="Available From" className="w-full border p-2" onChange={handleChange} />
                <input name="available_to" type="date" placeholder="Available To" className="w-full border p-2" onChange={handleChange} />
                {error && <p className="text-red-500">{error}</p>}
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Vehicle'}
                </button>
            </form>
        </div>
    )
} 