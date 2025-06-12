'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type OwnerRequest = {
    id: number
    user_id: number
    full_name: string
    driving_license_url: string
    address_proof_url: string
    ownership_declaration: string
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
    created_at: string
    user_email: string
    user_name: string
}

export default function OwnerRequestsPage() {
    const [requests, setRequests] = useState<OwnerRequest[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const res = await fetch('/api/admin/owner-requests')
            if (!res.ok) {
                throw new Error('Failed to fetch owner requests')
            }
            const data = await res.json()
            setRequests(data.requests)
        } catch (err) {
            console.error('Error fetching owner requests:', err)
            setError(err instanceof Error ? err.message : 'Failed to fetch requests')
        } finally {
            setLoading(false)
        }
    }

    const handleRequest = async (requestId: number, action: 'approve' | 'reject') => {
        try {
            const adminNotes = prompt('Enter admin notes (optional):')

            const res = await fetch('/api/admin/owner-requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    requestId,
                    action,
                    adminNotes
                })
            })

            if (!res.ok) {
                throw new Error('Failed to process request')
            }

            // Refresh the list
            fetchRequests()
        } catch (err) {
            console.error('Error processing request:', err)
            alert(err instanceof Error ? err.message : 'Failed to process request')
        }
    }

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Owner Requests</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                {requests.map(request => (
                    <div
                        key={request.id}
                        className="border rounded-lg p-6 bg-white shadow-sm"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    {request.full_name}
                                </h3>
                                <p className="text-gray-600">
                                    {request.user_email}
                                </p>
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

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <h4 className="font-medium mb-2">Documents</h4>
                                <div className="space-y-2">
                                    <a
                                        href={request.driving_license_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline block"
                                    >
                                        View Driving License
                                    </a>
                                    <a
                                        href={request.address_proof_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline block"
                                    >
                                        View Address Proof
                                    </a>
                                </div>
                            </div>
                            <div>
                                <h4 className="font-medium mb-2">Ownership Declaration</h4>
                                <p className="text-gray-600">
                                    {request.ownership_declaration}
                                </p>
                            </div>
                        </div>

                        {request.admin_notes && (
                            <div className="mb-4">
                                <h4 className="font-medium mb-1">Admin Notes</h4>
                                <p className="text-gray-600">{request.admin_notes}</p>
                            </div>
                        )}

                        {request.status === 'pending' && (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => handleRequest(request.id, 'approve')}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleRequest(request.id, 'reject')}
                                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {requests.length === 0 && (
                    <p className="text-gray-600 text-center py-8">
                        No owner requests found
                    </p>
                )}
            </div>
        </div>
    )
} 