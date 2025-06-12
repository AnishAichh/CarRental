'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddVehiclePage() {
    const [form, setForm] = useState({
        name: '',
        brand: '',
        type: 'car',
        price_per_day: '',
        image_url: ''
    })

    const router = useRouter()

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const res = await fetch('/api/vehicles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, price_per_day: parseInt(form.price_per_day) })
        })
        if (res.ok) {
            alert('Vehicle submitted for admin approval')
            router.push('/my-listings')
        } else {
            alert('Error submitting vehicle')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-6 mt-6 border rounded">
            <h2 className="text-2xl font-bold">List Your Vehicle</h2>
            <input name="name" placeholder="Vehicle Name" required className="w-full border p-2" onChange={handleChange} />
            <input name="brand" placeholder="Brand" className="w-full border p-2" onChange={handleChange} />
            <select name="type" className="w-full border p-2" onChange={handleChange}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
            </select>
            <input name="price_per_day" placeholder="Price per day (₹)" type="number" required className="w-full border p-2" onChange={handleChange} />
            <input name="image_url" placeholder="Image URL" required className="w-full border p-2" onChange={handleChange} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit Vehicle</button>
        </form>
    )
}
