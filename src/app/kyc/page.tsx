'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function KYCPage() {
    const [form, setForm] = useState({
        name: '',
        dob: '',
        document_type: 'aadhar',
        document_number: '',
        document_photo_url: '',
        selfie_url: '',
    })

    const router = useRouter()

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        const res = await fetch('/api/kyc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        if (res.ok) {
            alert('KYC submitted for review')
            router.push('/')
        } else {
            alert('Submission failed')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-6 mt-6 border rounded">
            <h2 className="text-2xl font-bold mb-2">KYC Verification</h2>
            <input name="name" placeholder="Full Name" required className="w-full border p-2" onChange={handleChange} />
            <input name="dob" type="date" required className="w-full border p-2" onChange={handleChange} />
            <select name="document_type" className="w-full border p-2" onChange={handleChange}>
                <option value="aadhar">Aadhar</option>
                <option value="pan">PAN</option>
                <option value="license">Driver License</option>
            </select>
            <input name="document_number" placeholder="Document Number" required className="w-full border p-2" onChange={handleChange} />
            <input name="document_photo_url" placeholder="URL of Document Photo" className="w-full border p-2" onChange={handleChange} />
            <input name="selfie_url" placeholder="URL of Your Selfie" className="w-full border p-2" onChange={handleChange} />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit for Review</button>
        </form>
    )
}
