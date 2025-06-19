'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddVehiclePage() {
    const [form, setForm] = useState({
        name: '',
        brand: '',
        type: 'car',
        price_per_day: '',
        image_url: '',
        rc_document_url: '',
        insurance_document_url: ''
    })
    const [uploading, setUploading] = useState({
        image: false,
        rc: false,
        insurance: false
    })
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileUpload = async (e: any, field: 'image_url' | 'rc_document_url' | 'insurance_document_url') => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(u => ({ ...u, [field === 'image_url' ? 'image' : field === 'rc_document_url' ? 'rc' : 'insurance']: true }))
        setError(null)
        try {
            const formData = new FormData()
            formData.append('image', file)
            const res = await fetch('/api/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Upload failed')
            setForm(f => ({ ...f, [field]: data.url }))
        } catch (err: any) {
            setError(err.message)
        } finally {
            setUploading(u => ({ ...u, [field === 'image_url' ? 'image' : field === 'rc_document_url' ? 'rc' : 'insurance']: false }))
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setError(null)
        if (!form.image_url || !form.rc_document_url || !form.insurance_document_url) {
            setError('Please upload vehicle image, RC document, and insurance document.')
            return
        }
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
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-6 mt-6 border rounded bg-white">
            <h2 className="text-2xl font-bold">List Your Vehicle</h2>
            <input name="name" placeholder="Vehicle Name" required className="w-full border p-2" onChange={handleChange} />
            <input name="brand" placeholder="Brand" className="w-full border p-2" onChange={handleChange} />
            <select name="type" className="w-full border p-2" onChange={handleChange}>
                <option value="car">Car</option>
                <option value="bike">Bike</option>
            </select>
            <input name="price_per_day" placeholder="Price per day (₹)" type="number" required className="w-full border p-2" onChange={handleChange} />
            <div>
                <label className="block mb-1 font-light text-emerald-700">Upload Vehicle Image</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image_url')} disabled={uploading.image} />
                {uploading.image && <div className="text-emerald-600 text-sm mt-1">Uploading...</div>}
                {form.image_url && <img src={form.image_url} alt="Vehicle" className="mt-2 max-h-32 rounded border" />}
            </div>
            <div>
                <label className="block mb-1 font-light text-emerald-700">Upload RC Document</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'rc_document_url')} disabled={uploading.rc} />
                {uploading.rc && <div className="text-emerald-600 text-sm mt-1">Uploading...</div>}
                {form.rc_document_url && <img src={form.rc_document_url} alt="RC Document" className="mt-2 max-h-32 rounded border" />}
            </div>
            <div>
                <label className="block mb-1 font-light text-emerald-700">Upload Insurance Document</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'insurance_document_url')} disabled={uploading.insurance} />
                {uploading.insurance && <div className="text-emerald-600 text-sm mt-1">Uploading...</div>}
                {form.insurance_document_url && <img src={form.insurance_document_url} alt="Insurance Document" className="mt-2 max-h-32 rounded border" />}
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded font-light hover:bg-emerald-700 transition">Submit Vehicle</button>
        </form>
    )
}
