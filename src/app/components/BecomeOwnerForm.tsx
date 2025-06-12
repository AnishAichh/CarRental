'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BecomeOwnerForm() {
    const [fullName, setFullName] = useState('')
    const [drivingLicense, setDrivingLicense] = useState<File | null>(null)
    const [addressProof, setAddressProof] = useState<File | null>(null)
    const [ownershipDeclaration, setOwnershipDeclaration] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            // Upload files first
            const formData = new FormData()
            if (drivingLicense) formData.append('file', drivingLicense)
            if (addressProof) formData.append('file', addressProof)

            const uploadRes = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!uploadRes.ok) {
                throw new Error('Failed to upload documents')
            }

            const { urls } = await uploadRes.json()

            // Submit owner request
            const res = await fetch('/api/owner-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName,
                    drivingLicenseUrl: urls[0],
                    addressProofUrl: urls[1],
                    ownershipDeclaration
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to submit request')
            }

            alert('Owner request submitted successfully!')
            router.push('/dashboard')
        } catch (err) {
            console.error('Error submitting owner request:', err)
            setError(err instanceof Error ? err.message : 'Failed to submit request')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Become a Vehicle Owner</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Driving License
                    </label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={e => setDrivingLicense(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Proof (Aadhaar/Other)
                    </label>
                    <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={e => setAddressProof(e.target.files?.[0] || null)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Ownership Declaration
                    </label>
                    <textarea
                        value={ownershipDeclaration}
                        onChange={e => setOwnershipDeclaration(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Please declare that you own or have legal rights to list vehicles on our platform..."
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                >
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    )
} 