'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { User } from '@/lib/types'
import { getAuthUser } from '@/lib/api' // Keep if User type is needed, but fetching user is moved to layout
import { BellIcon } from '@heroicons/react/24/outline';
import Confetti from 'react-confetti';

type OwnerRequest = {
    id: number
    status: 'pending' | 'approved' | 'rejected'
    admin_notes: string | null
}

export default function UserDashboardPage() {
    const [user, setUser] = useState<User | null>(null) // State for user data if needed for display within the page
    const [ownerRequest, setOwnerRequest] = useState<OwnerRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const searchParams = useSearchParams()
    const userId = searchParams?.get('user')
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [notifLoading, setNotifLoading] = useState(false);
    const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, requestRes] = await Promise.all([
                    fetch('/api/auth/me'),
                    fetch('/api/owner-request')
                ])

                if (!userRes.ok) {
                    // Handle redirection if user is not authenticated, though layout handles primary redirection
                    router.push('/login')
                    return
                }

                const userData = await userRes.json()
                setUser(userData.user)

                if (requestRes.ok) {
                    const requestData = await requestRes.json()
                    setOwnerRequest(requestData.request)
                }
            } catch (err) {
                console.error('Error fetching data:', err)
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [router])

    const fetchNotifications = async () => {
        setNotifLoading(true);
        try {
            const res = await fetch('/api/user/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } finally {
            setNotifLoading(false);
        }
    };

    const handleBellClick = () => {
        setShowNotifications(true);
        fetchNotifications();
    };

    const handleNotifClick = (notif: any) => {
        setSelectedNotif(notif);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
    };

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
        <div className="space-y-6 relative">
            {/* Notification Bell */}
            <button
                className="absolute top-4 right-4 z-20"
                onClick={handleBellClick}
                aria-label="Notifications"
            >
                <BellIcon className="h-8 w-8 text-emerald-600" />
                {notifications.some(n => !n.is_read) && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-emerald-500 border-2 border-white"></span>
                )}
            </button>

            {/* Notification Modal */}
            {showNotifications && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setShowNotifications(false)}>&times;</button>
                        <h3 className="text-lg font-light mb-4 text-emerald-900">Notifications</h3>
                        {notifLoading ? (
                            <div>Loading...</div>
                        ) : notifications.length === 0 ? (
                            <div className="text-gray-600">No notifications yet.</div>
                        ) : (
                            <ul className="divide-y">
                                {notifications.map((notif) => (
                                    <li
                                        key={notif.id}
                                        className="py-3 cursor-pointer hover:bg-blue-50 rounded"
                                        onClick={() => handleNotifClick(notif)}
                                    >
                                        <div className="font-semibold text-black">{notif.title}</div>
                                        <div className="text-gray-700 text-sm">{notif.message.slice(0, 60)}...</div>
                                        <div className="text-xs text-gray-400">{new Date(notif.created_at).toLocaleString()}</div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Details Modal with Confetti */}
            {selectedNotif && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative">
                        <button className="absolute top-2 right-2 text-gray-500" onClick={() => setSelectedNotif(null)}>&times;</button>
                        {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={300} />}
                        <h2 className="text-2xl font-bold mb-4 text-green-700">🎉 Booking Confirmed!</h2>
                        <div className="mb-2 font-semibold text-black">{selectedNotif.title}</div>
                        <div className="mb-4 text-gray-800 whitespace-pre-line">{selectedNotif.message}</div>
                        <button
                            className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                            onClick={() => setSelectedNotif(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Welcome Section */}
            <div className="bg-white shadow rounded-lg p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Welcome back, {user.name}!
                </h1>
                <p className="text-gray-600">
                    {user.kycVerified
                        ? 'Your account is fully verified and ready to go.'
                        : 'Complete your KYC verification to unlock all features.'}
                </p>
            </div>

            {/* Quick Actions - These are now handled by Navbar or specific sub-pages if necessary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link
                    href={`/dashboard/user/browse-vehicles?user=${user.id}`}
                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Browse Vehicles</h2>
                    <p className="text-gray-600">Find and book vehicles for your next trip.</p>
                </Link>

                <Link
                    href={`/dashboard/user/bookings?user=${user.id}`}
                    className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">My Bookings</h2>
                    <p className="text-gray-600">View and manage your current and past bookings.</p>
                </Link>

                {!user.kycVerified ? (
                    <Link
                        href={`/dashboard/kyc?user=${user.id}`}
                        className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-2">Complete KYC</h2>
                        <p className="text-gray-600">Verify your identity to unlock all features.</p>
                    </Link>
                ) : (
                    user.role === 'user' && !ownerRequest && (
                        <Link
                            href="/dashboard/become-owner"
                            className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Become an Owner</h2>
                            <p className="text-gray-600">List your vehicles and start earning.</p>
                        </Link>
                    )
                )}
            </div>

            {/* Account Status */}
            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Status</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Email Verification</span>
                        <span className="text-green-600">Verified</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">KYC Status</span>
                        <span className={user.kycVerified ? 'text-green-600' : 'text-yellow-600'}>
                            {user.kycVerified ? 'Verified' : 'Pending'}
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account Type</span>
                        <span className="text-blue-600">Regular User</span>
                    </div>
                    {ownerRequest && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Owner Request Status</span>
                            <span className={`${ownerRequest.status === 'pending' ? 'text-yellow-600' :
                                ownerRequest.status === 'approved' ? 'text-green-600' :
                                    'text-red-600'
                                }`}>
                                {ownerRequest.status.charAt(0).toUpperCase() + ownerRequest.status.slice(1)}
                            </span>
                        </div>
                    )}
                    {ownerRequest?.admin_notes && (
                        <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Admin Notes:</span> {ownerRequest.admin_notes}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
} 