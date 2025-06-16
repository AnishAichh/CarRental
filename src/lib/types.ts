export interface User {
    id: number
    name: string
    email: string
    role: 'user' | 'owner' | 'admin'
    avatar?: string
    kycVerified: boolean
    kyc_status?: 'pending' | 'approved' | 'rejected'
    isAdmin: boolean
    is_admin?: boolean
}

export interface Vehicle {
    id: number
    name: string
    description: string
    price: number
    location: string
    images: string[]
    ownerId: number
    available: boolean
}

export interface Booking {
    id: number
    vehicleId: number
    userId: number
    startDate: string
    endDate: string
    status: 'pending' | 'approved' | 'rejected' | 'completed'
    totalPrice: number
} 