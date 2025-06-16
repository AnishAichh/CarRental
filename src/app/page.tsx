'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from '@/lib/types'

export default function Home() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      setUser(null)
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Navbar */}
      <header className="w-full px-8 py-4 shadow-md bg-white sticky top-0 z-10 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">DriveX</Link>
        <nav className="space-x-4">
          <Link href="/browse-vehicles" className="hover:text-primary">Browse</Link>
          {!loading && user ? (
            <>
              {user.role === 'owner' && (
                <Link href="/dashboard/owner" className="hover:text-primary">Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link href="/dashboard/admin" className="hover:text-primary">Admin</Link>
              )}
              <button
                onClick={handleLogout}
                className="hover:text-primary"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-primary">Login</Link>
              <Link href="/register" className="hover:text-primary">Register</Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 bg-gray-50">
        <h2 className="text-4xl font-bold mb-4">Self-Drive Rentals Made Simple</h2>
        <p className="text-lg mb-8 text-gray-600 max-w-xl">
          Rent or list your own car or bike for self-drive across India. KYC secured, admin verified, decentralized bookings.
        </p>
        <div className="flex gap-4">
          {!loading && user ? (
            <>
              <Link
                href="/browse-vehicles"
                className="bg-primary text-black px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
              >
                Browse Vehicles
              </Link>
              {user.role === 'owner' ? (
                <Link
                  href="/dashboard/owner/vehicles/add"
                  className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
                >
                  List Your Vehicle
                </Link>
              ) : user.role === 'user' && user.kycVerified ? (
                <Link
                  href="/dashboard/become-owner"
                  className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 19.5L8.25 12l7.5-7.5"
                    />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/profile?kyc_required=true"
                  className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
                >
                  Complete KYC
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-primary text-black px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
              >
                Get Started
              </Link>
              <Link
                href="/register"
                className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
              >
                Register Now
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-16 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          <div className="p-6 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Decentralized Booking</h3>
            <p className="text-gray-600">Users list, users book. Platform just ensures safety and takes a small commission.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Verified via KYC</h3>
            <p className="text-gray-600">All users undergo KYC and admin approval before renting or booking.</p>
          </div>
          <div className="p-6 rounded-lg bg-gray-50">
            <h3 className="text-xl font-semibold mb-2">Track Earnings</h3>
            <p className="text-gray-600">Owners earn directly from their vehicles. Transparent payout reports available.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 text-center text-sm py-4 text-gray-500">
        &copy; {new Date().getFullYear()} DriveX • All rights reserved
      </footer>
    </div>
  )
}
