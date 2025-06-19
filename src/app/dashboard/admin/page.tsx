'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/types'

function AdminBookingsSection() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [confirmationId, setConfirmationId] = useState<number | null>(null);
    const [showPickupModal, setShowPickupModal] = useState(false);
    const [pickupInfo, setPickupInfo] = useState({ location: '', time: '', notes: '' });
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        async function fetchBookings() {
            setLoading(true);
            try {
                const res = await fetch('/api/admin/bookings');
                if (!res.ok) throw new Error('Failed to fetch bookings');
                const data = await res.json();
                setBookings(data);
            } catch (e: any) {
                setError(e.message || 'Error fetching bookings');
            } finally {
                setLoading(false);
            }
        }
        fetchBookings();
    }, []);

    const handleSendConfirmation = (booking: any) => {
        setSelectedBooking(booking);
        setPickupInfo({ location: '', time: '', notes: '' });
        setShowPickupModal(true);
    };

    const handlePickupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmationId(selectedBooking.id);
        setShowPickupModal(false);
        try {
            const res = await fetch(`/api/admin/bookings/${selectedBooking.id}/notify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pickupInfo),
            });
            if (!res.ok) {
                throw new Error('Failed to send confirmation');
            }
            setSuccessMsg('Confirmation sent to user with pickup info!');
        } catch (err) {
            setSuccessMsg('Failed to send confirmation.');
        } finally {
            setConfirmationId(null);
            setTimeout(() => setSuccessMsg(''), 2000);
        }
    };

    if (loading) return <div className="p-4">Loading bookings...</div>;
    if (error) return <div className="p-4 text-red-600">{error}</div>;

    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4 text-black">All Bookings</h2>
            {successMsg && <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">{successMsg}</div>}
            <div className="overflow-x-auto">
                <table className="min-w-full border text-black">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="px-4 py-2 border font-bold text-lg">Vehicle</th>
                            <th className="px-4 py-2 border font-bold text-lg">Renter Email</th>
                            <th className="px-4 py-2 border font-bold text-lg">Start Date</th>
                            <th className="px-4 py-2 border font-bold text-lg">End Date</th>
                            <th className="px-4 py-2 border font-bold text-lg">Total Price</th>
                            <th className="px-4 py-2 border font-bold text-lg">Platform Fee</th>
                            <th className="px-4 py-2 border font-bold text-lg">Status</th>
                            <th className="px-4 py-2 border font-bold text-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bookings.map((b: any, idx: number) => (
                            <tr key={b.id} className={"border-b " + (idx % 2 === 0 ? 'bg-white' : 'bg-gray-50')}>
                                <td className="px-4 py-2 border">{b.vehicle_name}</td>
                                <td className="px-4 py-2 border">{b.renter_email}</td>
                                <td className="px-4 py-2 border">{b.start_date}</td>
                                <td className="px-4 py-2 border">{b.end_date}</td>
                                <td className="px-4 py-2 border">${b.total_price}</td>
                                <td className="px-4 py-2 border">${b.platform_fee}</td>
                                <td className="px-4 py-2 border">{b.status}</td>
                                <td className="px-4 py-2 border">
                                    <button
                                        className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                                        onClick={() => handleSendConfirmation(b)}
                                        disabled={confirmationId === b.id}
                                    >
                                        {confirmationId === b.id ? 'Sending...' : 'Send Confirmation'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Pickup Info Modal */}
            {showPickupModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <form onSubmit={handlePickupSubmit} className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                        <h3 className="text-lg font-bold mb-4 text-black">Send Pickup Info</h3>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-black">Pickup Location</label>
                            <input
                                type="text"
                                className="w-full border rounded px-3 py-2 text-black"
                                value={pickupInfo.location}
                                onChange={e => setPickupInfo({ ...pickupInfo, location: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-black">Pickup Time</label>
                            <input
                                type="datetime-local"
                                className="w-full border rounded px-3 py-2 text-black"
                                value={pickupInfo.time}
                                onChange={e => setPickupInfo({ ...pickupInfo, time: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 font-medium text-black">Notes (optional)</label>
                            <textarea
                                className="w-full border rounded px-3 py-2 text-black"
                                value={pickupInfo.notes}
                                onChange={e => setPickupInfo({ ...pickupInfo, notes: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" className="px-4 py-2 rounded bg-gray-200 text-black" onClick={() => setShowPickupModal(false)}>
                                Cancel
                            </button>
                            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white">
                                Send Confirmation
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default function AdminDashboard() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch('/api/user/me')
                if (!response.ok) {
                    throw new Error('Failed to fetch user data')
                }
                const data = await response.json()
                setUser(data.user)
            } catch (error) {
                console.error('Error fetching user:', error)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    if (loading) {
        return (
            <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button
                            onClick={() => router.push('/dashboard/admin/kyc-requests')}
                            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Review KYC Requests
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/admin/owner-requests')}
                            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                        >
                            Review Owner Requests
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/admin/approve-vehicles')}
                            className="w-full bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors"
                        >
                            Review Vehicle Requests
                        </button>
                        <button
                            onClick={() => router.push('/dashboard/admin/view-approved-vehicles')}
                            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                            View Approved Vehicles
                        </button>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                    <div className="space-y-4">
                        <p className="text-gray-500">No recent activity</p>
                    </div>
                </div>

                {/* Platform Stats */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Platform Stats</h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Users</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Vehicles</span>
                            <span className="font-medium">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Total Bookings</span>
                            <span className="font-medium">0</span>
                        </div>
                    </div>
                </div>
            </div>
            <AdminBookingsSection />
        </div>
    )
} 