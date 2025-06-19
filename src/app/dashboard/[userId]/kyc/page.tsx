'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function KYCPage() {
    const [form, setForm] = useState({
        name: '',
        dob: '',
        document_type: 'aadhar',
        document_number: '',
        document_photo_url: '',
        selfie_url: '',
    })
    const [docUploading, setDocUploading] = useState(false)
    const [selfieUploading, setSelfieUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const router = useRouter()
    const searchParams = useSearchParams()
    const redirect = searchParams.get('redirect')

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleFileUpload = async (e: any, field: 'document_photo_url' | 'selfie_url') => {
        const file = e.target.files?.[0]
        if (!file) return
        field === 'document_photo_url' ? setDocUploading(true) : setSelfieUploading(true)
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
            field === 'document_photo_url' ? setDocUploading(false) : setSelfieUploading(false)
        }
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setError(null)
        if (!form.document_photo_url || !form.selfie_url) {
            setError('Please upload both document and selfie images.')
            return
        }
        const res = await fetch('/api/kyc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                full_name: form.name,
                dob: form.dob,
                document_type: form.document_type,
                document_number: form.document_number,
                document_image_url: form.document_photo_url,
                selfie_url: form.selfie_url,
            })
        })
        if (res.ok) {
            alert('KYC submitted for review')
            router.push(redirect || '/dashboard')
        } else {
            const data = await res.json()
            setError(data.error || 'Submission failed')
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 p-6 mt-6 border rounded bg-white">
            <h2 className="text-2xl font-bold mb-2">KYC Verification</h2>
            <input name="name" placeholder="Full Name" required className="w-full border p-2" onChange={handleChange} />
            <input name="dob" type="date" required className="w-full border p-2" onChange={handleChange} />
            <select name="document_type" className="w-full border p-2" onChange={handleChange}>
                <option value="aadhar">Aadhar</option>
                <option value="pan">PAN</option>
                <option value="license">Driver License</option>
            </select>
            <input name="document_number" placeholder="Document Number" required className="w-full border p-2" onChange={handleChange} />
            <div>
                <label className="block mb-1 font-light text-emerald-700">Upload Document Photo</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'document_photo_url')} disabled={docUploading} />
                {docUploading && <div className="text-emerald-600 text-sm mt-1">Uploading...</div>}
                {form.document_photo_url && <img src={form.document_photo_url} alt="Document" className="mt-2 max-h-32 rounded border" />}
            </div>
            <div>
                <label className="block mb-1 font-light text-emerald-700">Upload Selfie</label>
                <input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'selfie_url')} disabled={selfieUploading} />
                {selfieUploading && <div className="text-emerald-600 text-sm mt-1">Uploading...</div>}
                {form.selfie_url && <img src={form.selfie_url} alt="Selfie" className="mt-2 max-h-32 rounded border" />}
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded font-light hover:bg-emerald-700 transition">Submit for Review</button>
        </form>
    )
} 