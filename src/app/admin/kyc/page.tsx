'use client'

import { useEffect, useState } from 'react'

type KYCRequest = {
    id: number
    full_name: string
    dob: string
    document_type: string
    document_number: string
    document_image_url: string
    selfie_url: string
    status: string
    email: string
}

export default function AdminKYCPage() {
    const [requests, setRequests] = useState<KYCRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/kyc')
            if (!res.ok) {
                setError('Failed to fetch KYC requests')
                setLoading(false)
                return
            }
            const data = await res.json()
            setRequests(data)
        } catch (err) {
            setError('Error loading KYC data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchRequests()
    }, [])

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            const res = await fetch(`/api/admin/kyc/${id}/${action}`, {
                method: 'POST'
            })

            if (res.ok) {
                alert(`KYC ${action}d successfully`)
                setRequests(requests.filter(r => r.id !== id))
            } else {
                alert(`Failed to ${action} KYC`)
            }
        } catch (err) {
            alert('Error processing request')
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Pending KYC Requests</h2>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {requests.length === 0 && !loading && <p>No pending KYC requests.</p>}

            <div className="space-y-6">
                {requests.map(req => (
                    <div key={req.id} className="border p-4 rounded shadow bg-white">
                        <p><strong>Name:</strong> {req.full_name}</p>
                        <p><strong>Email:</strong> {req.email}</p>
                        <p><strong>Date of Birth:</strong> {req.dob}</p>
                        <p><strong>Document Type:</strong> {req.document_type}</p>
                        <p><strong>Number:</strong> {req.document_number}</p>
                        <p><strong>Status:</strong> {req.status}</p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <div>
                                <p className="text-sm mb-1">Document:</p>
                                <img src={req.document_image_url} alt="Document" className="w-64 border rounded" />
                            </div>
                            <div>
                                <p className="text-sm mb-1">Selfie:</p>
                                <img src={req.selfie_url} alt="Selfie" className="w-64 border rounded" />
                            </div>
                        </div>

                        <div className="mt-4 flex gap-4">
                            <button
                                onClick={() => handleAction(req.id, 'approve')}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            >
                                Approve
                            </button>
                            <button
                                onClick={() => handleAction(req.id, 'reject')}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
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
