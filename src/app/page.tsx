'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

type User = {
  id: number
}

// Mock data for demonstration
const topVehicles = [
  {
    id: 1,
    name: "Toyota Camry",
    location: "Guwahati",
    pricePerDay: 3200,
    rating: 4.9,
    reviews: 120,
    image: "/camry.png"
  },
  {
    id: 2,
    name: "Hyundai Creta",
    location: "Shillong",
    pricePerDay: 3500,
    rating: 4.7,
    reviews: 110,
    image: "/creta.png"
  },
  {
    id: 3,
    name: "Royal Enfield",
    location: "Goa",
    pricePerDay: 1200,
    rating: 4.7,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop"
  },
  {
    id: 4,
    name: "BMW X1",
    location: "Bangalore",
    pricePerDay: 4500,
    rating: 4.8,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=200&fit=crop"
  }
]

const topReviews = [
  {
    id: 1,
    user: "Rajesh Kumar",
    rating: 5,
    comment: "Amazing service! The car was clean and well-maintained. Highly recommend Vheego for hassle-free rentals."
  },
  {
    id: 2,
    user: "Priya Sharma",
    rating: 5,
    comment: "Loved the experience! Easy booking process and the vehicle was exactly as described. Will use again!"
  },
  {
    id: 3,
    user: "Amit Patel",
    rating: 4,
    comment: "Great platform for vehicle rentals. Good variety of options and transparent pricing."
  }
]

const holidayPackages = [
  {
    id: 1,
    name: "Goa Beach Paradise",
    description: "3 days of sun, sand, and adventure with a premium vehicle",
    price: 15999,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
    locked: false
  },
  {
    id: 2,
    name: "Kerala Backwaters",
    description: "Explore the serene backwaters with our curated travel package",
    price: 22999,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
    locked: false
  },
  {
    id: 3,
    name: "Rajasthan Royal Tour",
    description: "Experience the royal heritage with luxury vehicles and accommodations",
    price: 35999,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop",
    locked: true
  }
]

export default function HomePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Simulate auth check
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUser(null) // Set to null for demo, change to actual user data
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
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <main className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-light tracking-tight text-gray-900 mb-6 sm:mb-8">
              <span className="block">Vheego</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl text-emerald-600 font-normal mt-2">
                Decentralized Vehicle Rentals
              </span>
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto font-light leading-relaxed px-4 sm:px-0">
              Empowering users, owners, drivers, and businesses to unlock income, find rentals, and experience curated travel across India.
            </p>
            {user ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
                <Link
                  href={`/dashboard/${user.id}`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-gray-500 rounded-full hover:bg-gray-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="px-4 sm:px-0">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-medium text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto"
                >
                  Login to Book Now
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Vehicles */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">Top Rented Vehicles</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {topVehicles.map((vehicle, idx) => {
              // Premium locked card for non-logged users
              if (!user && idx === 3) {
                return (
                  <div key={vehicle.id} className="relative flex flex-col items-center">
                    <div className="group relative bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 rounded-2xl border border-emerald-100/50 p-6 sm:p-8 overflow-hidden backdrop-blur-xl shadow-2xl hover:shadow-3xl transition-all duration-700 hover:-translate-y-2 w-full">
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-md rounded-3xl"></div>

                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                        <div className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-lg">
                          <span>🔒</span>
                          <span>Premium</span>
                        </div>
                      </div>
                      <div className="relative z-5 flex flex-col items-center justify-center filter blur-[2px] group-hover:blur-[1px] transition-all duration-500">
                        <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
                          <Image
                            src={vehicle.image}
                            alt={vehicle.name}
                            width={200}
                            height={140}
                            className="w-full object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-500"
                          />
                        </div>
                        <h3 className="text-xl font-medium text-gray-800 mb-2">{vehicle.name}</h3>
                        <div className="text-gray-600 mb-3">{vehicle.location}</div>
                        <div className="text-2xl font-bold text-emerald-600/80 mb-3">
                          ₹{vehicle.pricePerDay}
                          <span className="text-sm font-normal text-gray-500">/day</span>
                        </div>
                        <div className="flex items-center justify-center space-x-1 text-yellow-400/80">
                          <span>★</span>
                          <span className="text-gray-800 font-medium">{vehicle.rating}</span>
                          <span className="text-gray-600 text-sm">({vehicle.reviews} reviews)</span>
                        </div>
                      </div>

                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600/10 via-transparent to-teal-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-sm z-10">
                        <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 px-4">
                          <div className="text-2xl sm:text-3xl mb-2 sm:mb-3"></div>
                          <div className="text-base sm:text-lg font-medium text-emerald-700 mb-1 sm:mb-2">Premium Vehicle</div>
                          <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Login to unlock exclusive deals</div>
                          <button className="bg-emerald-600 text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                            Unlock Now
                          </button>
                        </div>
                      </div>

                      <div className="absolute -top-10 -right-10 w-20 h-20 bg-emerald-200/20 rounded-full blur-xl"></div>
                      <div className="absolute -bottom-5 -left-5 w-16 h-16 bg-teal-200/20 rounded-full blur-lg"></div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={vehicle.id} className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                  <div className="text-center">
                    <div className="mb-6 overflow-hidden rounded-2xl shadow-lg">
                      <Image
                        src={vehicle.image}
                        alt={vehicle.name}
                        width={200}
                        height={140}
                        className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500 opacity-90"
                      />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">{vehicle.name}</h3>
                    <div className="text-gray-600 mb-3">{vehicle.location}</div>
                    <div className="text-2xl font-bold text-emerald-600 mb-3">
                      ₹{vehicle.pricePerDay}
                      <span className="text-sm font-normal text-gray-500">/day</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-yellow-500">
                      <span>★</span>
                      <span className="text-gray-900 font-medium">{vehicle.rating}</span>
                      <span className="text-gray-500 text-sm">({vehicle.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">What Our Customers Say</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {topReviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300">
                <div className="text-center">
                  <div className="text-yellow-500 text-xl sm:text-2xl mb-3 sm:mb-4">
                    {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-gray-700 text-base sm:text-lg italic mb-4 sm:mb-6 leading-relaxed">"{review.comment}"</p>
                  <div className="text-emerald-600 font-medium text-sm sm:text-base">— {review.user}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">Why Choose Vheego?</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: "💰",
                title: "Unlock Income From Your Idle Car",
                description: "List your car or bike and earn passive income when you're not using it. Vheego helps you recover costs and maximize value."
              },
              {
                icon: "🔍",
                title: "Find Rentals Without the Hassle",
                description: "No more endless searching. Instantly find verified, nearby vehicles—self-drive or with a driver—on Vheego."
              },
              {
                icon: "🧑‍✈️",
                title: "Driver-Powered Option",
                description: "Connects drivers with bookings. Owners can allow bookings with a driver, and Vheego assigns reliable drivers for gigs."
              },
              {
                icon: "🏢",
                title: "Inspection & Dispatch Centers",
                description: "Central operations in each city for inspections, cleaning, and logistics—ensuring a smooth, worry-free experience."
              },
              {
                icon: "🏪",
                title: "Empowering Small Rental Businesses",
                description: "Existing rental businesses can list fleets on Vheego—no harsh caps, just boosted visibility and quality standards."
              },
              {
                icon: "🧳",
                title: "Trip Packages & Curation",
                description: "Curated packages: vehicles, hotel stays, local experiences, and even a trusted driver if you want one."
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3 sm:mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Holiday Packages */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">Book Your Holiday With Us</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {holidayPackages.map(pkg => (
              <div key={pkg.id} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 relative">
                <div className="overflow-hidden">
                  <Image
                    src={pkg.image}
                    alt={pkg.name}
                    width={400}
                    height={240}
                    className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2 sm:mb-3">{pkg.name}</h3>
                  <p className="text-gray-600 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{pkg.description}</p>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600">₹{pkg.price.toLocaleString()}</div>
                </div>
                {pkg.locked && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center rounded-2xl backdrop-blur-sm">
                    <div className="text-center px-4">
                      <div className="text-xl sm:text-2xl font-light text-gray-900 mb-3 sm:mb-4">Login to unlock</div>
                      <Link href="/login" className="inline-flex items-center px-6 sm:px-8 py-2 sm:py-3 text-white bg-emerald-600 rounded-full hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base">
                        Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">About Vheego</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-12">
            <p className="text-lg sm:text-xl text-gray-700 text-center mb-6 sm:mb-8 leading-relaxed">
              Vheego is a decentralized self-drive and driver-based vehicle rental platform designed to redefine how India travels—for users, vehicle owners, drivers, and rental businesses alike. Instantly find or list cars and bikes, with or without a driver. Our automated system ensures you find the right vehicle, at the right place, at the right time—while empowering anyone to unlock income or travel with ease.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
              {[
                "💰 Unlock income from your idle car or bike",
                "🔍 Instantly find rentals without the hassle",
                "🧑‍✈️ Driver-powered options for owners and drivers",
                "🏢 City-based inspection & dispatch centers",
                "🏪 Empowering small rental businesses",
                "🧳 Curated trip packages and experiences"
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-gray-700 text-sm sm:text-base">
                  <span className="text-lg sm:text-xl flex-shrink-0">{item.split(' ')[0]}</span>
                  <span>{item.substring(item.indexOf(' ') + 1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4">Contact Us</h2>
            <div className="w-24 h-1 bg-emerald-600 mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 sm:p-10">
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 sm:mb-8">Reach Us</h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 text-sm sm:text-base">✉️</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-500 text-sm">Email</div>
                    <a href="mailto:support@vheego.com" className="text-emerald-600 hover:text-emerald-700 transition-colors text-sm sm:text-base break-all">support@vheego.com</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 text-sm sm:text-base">📞</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-500 text-sm">Phone</div>
                    <a href="tel:+919876543210" className="text-emerald-600 hover:text-emerald-700 transition-colors text-sm sm:text-base">+91 98765 43210</a>
                  </div>
                </div>
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-emerald-600 text-sm sm:text-base">📍</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-gray-500 text-sm">Address</div>
                    <div className="text-gray-700 text-sm sm:text-base">123, Vheego HQ, Guwahati, Assam, India</div>
                  </div>
                </div>
              </div>
            </div>
            <form className="bg-white rounded-2xl border border-gray-100 p-10">
              <h3 className="text-2xl font-medium text-gray-900 mb-8">Send Us a Message</h3>
              <div className="space-y-6">                <input
                type="text"
                placeholder="Your Name"
                className="w-full px-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base"
                required
              />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm sm:text-base"
                  required
                />
                <textarea
                  placeholder="Your Message"
                  className="w-full px-4 py-3 sm:py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none text-sm sm:text-base"
                  rows={4}
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 sm:py-4 rounded-xl font-medium hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}