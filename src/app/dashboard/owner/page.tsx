import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { verifyJWT } from '@/lib/auth'
import OwnerDashboard from '@/components/dashboard/owner/OwnerDashboard'

export const metadata: Metadata = {
    title: 'Owner Dashboard | DriveX',
    description: 'Manage your vehicles and bookings'
}

export default async function OwnerDashboardPage() {
    const token = cookies().get('token')?.value
    if (!token) {
        redirect('/login?redirect=/dashboard/owner')
    }

    const decoded = await verifyJWT(token)
    if (typeof decoded !== 'object' || !('id' in decoded)) {
        redirect('/login?redirect=/dashboard/owner')
    }

    // Verify owner role
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/me`, {
        headers: {
            Cookie: `token=${token}`
        }
    })

    if (!response.ok) {
        redirect('/login?redirect=/dashboard/owner')
    }

    const { user } = await response.json()
    if (user.role !== 'owner') {
        redirect('/dashboard')
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Owner Dashboard</h1>
            <OwnerDashboard />
        </div>
    )
} 