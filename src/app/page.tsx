'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/user/me')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setUserRole(data.role)
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }
    checkAuth()
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Navbar */}
      <header className="w-full px-8 py-4 shadow-md bg-white sticky top-0 z-10 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">DriveX</Link>
        <nav className="space-x-4">
          <Link href="/vehicles" className="hover:text-primary">Browse</Link>
          {isLoggedIn ? (
            <>
              {userRole === 'owner' && (
                <Link href="/dashboard/owner" className="hover:text-primary">Dashboard</Link>
              )}
              {userRole === 'admin' && (
                <Link href="/admin" className="hover:text-primary">Admin</Link>
              )}
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  setIsLoggedIn(false)
                  setUserRole(null)
                  router.push('/')
                }}
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
          <Link
            href="/vehicles"
            className="bg-primary text-black px-6 py-3 rounded-md hover:bg-primary-dark transition-colors"
          >
            Browse Vehicles
          </Link>
          {isLoggedIn && userRole === 'owner' ? (
            <Link
              href="/dashboard/owner/vehicles/add"
              className="bg-gray-800 text-black px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
            >
              List Your Vehicle
            </Link>
          ) : (
            <Link
              href="/register?role=owner"
              className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-900 transition-colors"
            >
              Become an Owner
            </Link>
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
