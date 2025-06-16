'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Form validation schema
const formSchema = z.object({
    fullName: z.string().optional(),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    governmentIdType: z.string().optional(),
    governmentIdNumber: z.string().optional(),
    idImageUrl: z.string().optional(),
    selfieUrl: z.string().optional(),
    vehicleType: z.string().optional(),
    brandModel: z.string().optional(),
    registrationNumber: z.string().optional(),
    yearOfManufacture: z.union([z.string(), z.number()]).optional(),
    fuelType: z.string().optional(),
    transmission: z.string().optional(),
    seatingCapacity: z.coerce.number().min(1, "Seating capacity must be at least 1").optional(),
    vehiclePhotoUrl: z.string().optional(),
    insuranceDocumentUrl: z.string().optional(),
    rcDocumentUrl: z.string().optional(),
    pricePerDay: z.union([z.string(), z.number()]).optional(),
    availableFrom: z.string().optional(),
    availableTo: z.string().optional(),
    agreeToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms and conditions." })
})

type FormData = z.infer<typeof formSchema>

export default function BecomeOwnerForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentStep, setCurrentStep] = useState(1)
    const [userEmail, setUserEmail] = useState('')
    const [userId, setUserId] = useState<number | null>(null)
    const [storedFormData, setStoredFormData] = useState<Partial<FormData>>({})

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        trigger,
        getValues
    } = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            agreeToTerms: false
        }
    })

    // Fetch user email and ID on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/user/me')
                if (res.ok) {
                    const data = await res.json()
                    setUserEmail(data.email)
                    setUserId(data.id)
                    setValue('email', data.email)
                }
            } catch (err) {
                console.error('Error fetching user data:', err)
            }
        }
        fetchUserData()
    }, [setValue])

    const nextStep = async () => {
        const fields = getFieldsForStep(currentStep)
        const isValid = await trigger(fields)
        if (isValid) {
            // Store current step data
            const currentData = getValues(fields)
            setStoredFormData(prev => ({ ...prev, ...currentData }))
            setCurrentStep(prev => prev + 1)
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => prev - 1)
    }

    const onSubmit = async (data: FormData) => {
        setLoading(true)
        setError(null)

        try {
            // Combine stored form data with current data
            const finalData = { ...storedFormData, ...data }

            // Convert camelCase keys to snake_case and remove numeric keys
            function toSnakeCase(obj: Record<string, any>) {
                const newObj: Record<string, any> = {}
                for (const key in obj) {
                    if (!isNaN(Number(key))) continue // skip numeric keys
                    let snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
                    // Special case: ownershipDeclaration -> ownership_declaration
                    if (key === 'ownershipDeclaration') snakeKey = 'ownership_declaration'
                    // Special case: brandModel -> brand_model
                    if (key === 'brandModel') snakeKey = 'brand_model'
                    // Special case: idImageUrl -> id_image_url
                    if (key === 'idImageUrl') snakeKey = 'id_image_url'
                    // Special case: selfieUrl -> selfie_url
                    if (key === 'selfieUrl') snakeKey = 'selfie_url'
                    // Special case: vehiclePhotoUrl -> vehicle_photo_url
                    if (key === 'vehiclePhotoUrl') snakeKey = 'vehicle_photo_url'
                    // Special case: insuranceDocumentUrl -> insurance_document_url
                    if (key === 'insuranceDocumentUrl') snakeKey = 'insurance_document_url'
                    // Special case: rcDocumentUrl -> rc_document_url
                    if (key === 'rcDocumentUrl') snakeKey = 'rc_document_url'
                    // Special case: availableFrom -> available_from
                    if (key === 'availableFrom') snakeKey = 'available_from'
                    // Special case: availableTo -> available_to
                    if (key === 'availableTo') snakeKey = 'available_to'
                    // Special case: phoneNumber -> phone_number
                    if (key === 'phoneNumber') snakeKey = 'phone_number'
                    // Special case: governmentIdType -> government_id_type
                    if (key === 'governmentIdType') snakeKey = 'government_id_type'
                    // Special case: governmentIdNumber -> government_id_number
                    if (key === 'governmentIdNumber') snakeKey = 'government_id_number'
                    // Special case: registrationNumber -> registration_number
                    if (key === 'registrationNumber') snakeKey = 'registration_number'
                    // Special case: yearOfManufacture -> year_of_manufacture
                    if (key === 'yearOfManufacture') snakeKey = 'year_of_manufacture'
                    // Special case: fuelType -> fuel_type
                    if (key === 'fuelType') snakeKey = 'fuel_type'
                    // Special case: seatingCapacity -> seating_capacity
                    if (key === 'seatingCapacity') snakeKey = 'seating_capacity'
                    // Special case: pricePerDay -> price_per_day
                    if (key === 'pricePerDay') snakeKey = 'price_per_day'
                    // Special case: vehicleType -> vehicle_type
                    if (key === 'vehicleType') snakeKey = 'vehicle_type'
                    // Special case: transmission -> transmission (no change)
                    // Special case: fullName -> full_name
                    if (key === 'fullName') snakeKey = 'full_name'
                    newObj[snakeKey] = obj[key]
                }
                return newObj
            }

            // Add ownership_declaration if user agreed to terms
            let payload = toSnakeCase(finalData)
            if (finalData.agreeToTerms) {
                // Remove ownership_declaration as it's not in the schema
                delete payload.ownership_declaration;
            }

            // Convert empty string date fields to undefined
            if (payload.available_from === "") payload.available_from = undefined;
            if (payload.available_to === "") payload.available_to = undefined;

            // Ensure email is set from userEmail state
            payload.email = userEmail;

            // Ensure vehicle name, type, and brand are set
            payload.name = payload.brand_model;
            payload.type = payload.vehicle_type;
            if (!payload.brand && payload.brand_model) {
                // Optionally extract brand from brand_model if not present
                payload.brand = payload.brand_model.split(' ')[0];
            }

            console.log('payload:', payload)

            // Submit owner request with mapped data
            const res = await fetch('/api/owner-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Failed to submit request')
            }

            alert('Owner request submitted successfully! Waiting for admin approval.')
            router.push(`/dashboard/user?user=${userId}`)
        } catch (err) {
            console.error('Error submitting owner request:', err)
            setError(err instanceof Error ? err.message : 'Failed to submit request')
        } finally {
            setLoading(false)
        }
    }

    const getFieldsForStep = (step: number): (keyof FormData)[] => {
        switch (step) {
            case 1:
                return ['fullName', 'phoneNumber', 'email', 'address', 'governmentIdType', 'governmentIdNumber', 'idImageUrl', 'selfieUrl']
            case 2:
                return ['vehicleType', 'brandModel', 'registrationNumber', 'yearOfManufacture', 'fuelType', 'transmission', 'seatingCapacity', 'vehiclePhotoUrl', 'insuranceDocumentUrl', 'rcDocumentUrl']
            case 3:
                return ['pricePerDay', 'availableFrom', 'availableTo']
            case 4:
                return ['agreeToTerms']
            default:
                return []
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Become a Vehicle Owner</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="mb-8">
                <div className="flex justify-between mb-2">
                    {[1, 2, 3, 4].map(step => (
                        <div
                            key={step}
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${step <= currentStep
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-600'
                                }`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                    <span>Personal Info</span>
                    <span>Vehicle Details</span>
                    <span>Pricing</span>
                    <span>Terms</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {currentStep === 1 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Personal Information</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name
                            </label>
                            <input
                                type="text"
                                {...register('fullName')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.fullName && (
                                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                {...register('phoneNumber')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.phoneNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                defaultValue={userEmail}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <textarea
                                {...register('address')}
                                rows={3}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.address && (
                                <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Government ID Type
                            </label>
                            <select
                                {...register('governmentIdType')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select ID Type</option>
                                <option value="aadhar">Aadhar Card</option>
                                <option value="pan">PAN Card</option>
                                <option value="license">Driving License</option>
                            </select>
                            {errors.governmentIdType && (
                                <p className="text-red-500 text-sm mt-1">{errors.governmentIdType.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Government ID Number
                            </label>
                            <input
                                type="text"
                                {...register('governmentIdNumber')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.governmentIdNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.governmentIdNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID Image URL
                            </label>
                            <input
                                type="url"
                                {...register('idImageUrl')}
                                placeholder="https://example.com/id-image.jpg"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.idImageUrl && (
                                <p className="text-red-500 text-sm mt-1">{errors.idImageUrl.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selfie URL
                            </label>
                            <input
                                type="url"
                                {...register('selfieUrl')}
                                placeholder="https://example.com/selfie.jpg"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.selfieUrl && (
                                <p className="text-red-500 text-sm mt-1">{errors.selfieUrl.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 2 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Vehicle Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Type
                            </label>
                            <select
                                {...register('vehicleType')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Vehicle Type</option>
                                <option value="car">Car</option>
                                <option value="bike">Bike</option>
                            </select>
                            {errors.vehicleType && (
                                <p className="text-red-500 text-sm mt-1">{errors.vehicleType.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Brand & Model
                            </label>
                            <input
                                type="text"
                                {...register('brandModel')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.brandModel && (
                                <p className="text-red-500 text-sm mt-1">{errors.brandModel.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Registration Number
                            </label>
                            <input
                                type="text"
                                {...register('registrationNumber')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.registrationNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Year of Manufacture
                            </label>
                            <input
                                type="number"
                                {...register('yearOfManufacture', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.yearOfManufacture && (
                                <p className="text-red-500 text-sm mt-1">{errors.yearOfManufacture.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fuel Type
                            </label>
                            <select
                                {...register('fuelType')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Fuel Type</option>
                                <option value="petrol">Petrol</option>
                                <option value="diesel">Diesel</option>
                                <option value="ev">Electric</option>
                            </select>
                            {errors.fuelType && (
                                <p className="text-red-500 text-sm mt-1">{errors.fuelType.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Transmission
                            </label>
                            <select
                                {...register('transmission')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select Transmission</option>
                                <option value="manual">Manual</option>
                                <option value="automatic">Automatic</option>
                            </select>
                            {errors.transmission && (
                                <p className="text-red-500 text-sm mt-1">{errors.transmission.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seating Capacity
                            </label>
                            <input
                                type="number"
                                {...register('seatingCapacity', { valueAsNumber: true })}
                                min="1"
                                placeholder="e.g., 4 or 5"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.seatingCapacity && (
                                <p className="text-red-500 text-sm mt-1">{errors.seatingCapacity.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vehicle Photo URL
                            </label>
                            <input
                                type="url"
                                {...register('vehiclePhotoUrl')}
                                placeholder="https://example.com/vehicle-photo.jpg"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.vehiclePhotoUrl && (
                                <p className="text-red-500 text-sm mt-1">{errors.vehiclePhotoUrl.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Insurance Document URL
                            </label>
                            <input
                                type="url"
                                {...register('insuranceDocumentUrl')}
                                placeholder="https://example.com/insurance.pdf"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.insuranceDocumentUrl && (
                                <p className="text-red-500 text-sm mt-1">{errors.insuranceDocumentUrl.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                RC Document URL
                            </label>
                            <input
                                type="url"
                                {...register('rcDocumentUrl')}
                                placeholder="https://example.com/rc.pdf"
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.rcDocumentUrl && (
                                <p className="text-red-500 text-sm mt-1">{errors.rcDocumentUrl.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 3 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Pricing & Availability</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Price per Day (₹)
                            </label>
                            <input
                                type="number"
                                {...register('pricePerDay', { valueAsNumber: true })}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.pricePerDay && (
                                <p className="text-red-500 text-sm mt-1">{errors.pricePerDay.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available From
                            </label>
                            <input
                                type="date"
                                {...register('availableFrom')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.availableFrom && (
                                <p className="text-red-500 text-sm mt-1">{errors.availableFrom.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Available To (Optional)
                            </label>
                            <input
                                type="date"
                                {...register('availableTo')}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.availableTo && (
                                <p className="text-red-500 text-sm mt-1">{errors.availableTo.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {currentStep === 4 && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Terms & Conditions</h3>

                        <div className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-medium mb-2">Owner Agreement</h4>
                            <p className="text-sm text-gray-600 mb-4">
                                By becoming an owner on our platform, you agree to:
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-2">
                                <li>Maintain your vehicle in good condition</li>
                                <li>Provide accurate vehicle information</li>
                                <li>Honor all bookings and reservations</li>
                                <li>Follow our pricing guidelines</li>
                                <li>Comply with all local laws and regulations</li>
                            </ul>
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                {...register('agreeToTerms')}
                                className="mt-1"
                            />
                            <label className="ml-2 text-sm text-gray-600">
                                I agree to the terms and conditions
                            </label>
                        </div>
                        {errors.agreeToTerms && (
                            <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms.message}</p>
                        )}
                    </div>
                )}

                <div className="flex justify-between pt-6">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
                        >
                            Previous
                        </button>
                    )}

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-2 rounded-md text-white font-medium ${loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
} 