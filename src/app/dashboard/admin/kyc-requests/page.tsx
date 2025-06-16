'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type KYCRequest = {
    id: number
    user_id: number
    full_name: string
    dob: string
    document_type: string
    document_number: string
    document_image_url: string
    selfie_url: string
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    created_at: string
    user: {
        id: number
        name: string
        email: string
    }
}

export default function KYCRequestsPage() {
    const [requests, setRequests] = useState<KYCRequest[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('/api/admin/kyc-requests')
                if (!response.ok) {
                    throw new Error('Failed to fetch KYC requests')
                }
                const data = await response.json()
                setRequests(data.requests)
            } catch (err) {
                console.error('Error fetching KYC requests:', err)
                setError('Failed to load KYC requests')
            } finally {
                setIsLoading(false)
            }
        }

        fetchRequests()
    }, [])

    const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
        try {
            const response = await fetch(`/api/admin/kyc-requests/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            })

            if (!response.ok) {
                throw new Error(`Failed to ${action} KYC request`)
            }

            // Update the local state
            setRequests(requests.map(request =>
                request.id === requestId
                    ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
                    : request
            ))
        } catch (err) {
            console.error(`Error ${action}ing KYC request:`, err)
            setError(`Failed to ${action} KYC request`)
        }
    }

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">KYC Requests</h1>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {requests.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                        No KYC requests found
                    </div>
                ) : (
                    requests.map((request) => (
                        <div key={request.id} className="bg-white shadow rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold">{request.full_name}</h2>
                                    <p className="text-gray-600">{request.user.email}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${request.status === 'pending'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : request.status === 'approved'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Document Type:</span> {request.document_type}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Document Number:</span> {request.document_number}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Date of Birth:</span> {new Date(request.dob).toLocaleDateString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-gray-600">
                                        <span className="font-medium">Submitted:</span> {new Date(request.created_at).toLocaleString()}
                                    </p>
                                    {request.admin_notes && (
                                        <p className="text-gray-600">
                                            <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex space-x-4 mb-4">
                                <a
                                    href={request.document_image_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View Document
                                </a>
                                <a
                                    href={request.selfie_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800"
                                >
                                    View Selfie
                                </a>
                            </div>

                            {request.status === 'pending' && (
                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => handleAction(request.id, 'approve')}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(request.id, 'reject')}
                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
} 