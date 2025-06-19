'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type OwnerRequest = {
    id: number
    user_id: number
    status: 'pending' | 'approved' | 'rejected'
    created_at: string
    admin_notes: string | null
    request_type: 'owner_application' | 'vehicle_submission'
    user: {
        id: number
        name: string
        email: string
    }
} & ( // Conditional type for vehicle submission fields
        | {
            request_type: 'owner_application';
            full_name: string;
            phone_number: string;
            email: string;
            address: string;
            government_id_type: string;
            government_id_number: string;
            id_image_url: string;
            selfie_url: string;
            // Vehicle details from owner_request if present (from initial form)
            vehicle_type: string;
            brand_model: string;
            registration_number: string;
            year_of_manufacture: number;
            fuel_type: string;
            transmission: string;
            seating_capacity: number;
            vehicle_photo_url: string;
            insurance_document_url: string;
            rc_document_url: string;
            price_per_day: number;
            available_from: string;
            available_to: string | null;
        }
        | {
            request_type: 'vehicle_submission';
            vehicle_id: number;
            name: string; // Vehicle name
            brand: string;
            model: string;
            year: number;
            price_per_day: number;
            image_url: string; // Vehicle image URL
            registration_number: string;
            fuel_type: string;
            transmission: string;
            seating_capacity: number;
            insurance_details: string;
            documents: string;
            vehicle_status: string; // Status from vehicles table (e.g., pending_approval)
            is_available: boolean;
        }
    )

export default function OwnerRequests() {
    const [requests, setRequests] = useState<OwnerRequest[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('/api/admin/owner-requests')
                if (!response.ok) {
                    throw new Error('Failed to fetch owner requests')
                }
                const data = await response.json()
                setRequests(data.requests)
            } catch (error) {
                console.error('Error fetching owner requests:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [])

    const handleRequest = async (requestId: number, action: 'approve' | 'reject') => {
        try {
            const response = await fetch('/api/admin/owner-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ requestId, action, adminNotes: null }),
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error(`Failed to ${action} request`)
            }

            // Update the local state
            setRequests(requests.map(request =>
                request.id === requestId
                    ? { ...request, status: action === 'approve' ? 'approved' : 'rejected' }
                    : request
            ))
        } catch (error) {
            console.error(`Error ${action}ing request:`, error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 text-black p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold">Owner Requests</h1>
                    <button
                        onClick={() => router.back()}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow overflow-hidden">
                    {requests.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No pending owner requests
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Request Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                                        Requested At
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {requests.map((request) => (
                                    <tr key={request.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                {request.user.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {request.user.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.request_type === 'owner_application' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                {request.request_type.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 ">
                                            {request.request_type === 'owner_application' ? (
                                                <div className="text-sm text-gray-900">
                                                    <div>Owner: {request.full_name}</div>
                                                    <div>Phone: {request.phone_number}</div>
                                                    <div>ID Type: {request.government_id_type}</div>
                                                    <div>ID Num: {request.government_id_number}</div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10 relative mr-2">
                                                        <Image
                                                            className="rounded-full"
                                                            src={request.image_url || '/placeholder-car.jpg'}
                                                            alt={request.name}
                                                            fill
                                                            style={{ objectFit: 'cover' }}
                                                        />
                                                    </div>
                                                    <div className="text-sm text-gray-900">
                                                        <div>{request.brand} {request.model} ({request.year})</div>
                                                        <div>Reg: {request.registration_number}</div>
                                                        <div>Price/Day: ₹{request.price_per_day}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.status === 'pending'
                                                ? 'bg-yellow-100 text-yellow-800'
                                                : request.status === 'approved'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {request.status === 'pending' && (
                                                <div className="space-x-2">
                                                    <button
                                                        onClick={() => handleRequest(request.id, 'approve')}
                                                        className="text-green-600 hover:text-green-900"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleRequest(request.id, 'reject')}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
} 