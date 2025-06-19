import Image from 'next/image'
import { useState } from 'react'

interface AvatarProps {
    src?: string
    alt: string
    size?: 'sm' | 'md' | 'lg'
    fallback?: string
}

export default function Avatar({ src, alt, size = 'md', fallback }: AvatarProps) {
    const [error, setError] = useState(false)

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    }

    if (!src || error) {
        return (
            <div
                className={`${sizeClasses[size]} rounded-full bg-emerald-100 flex items-center justify-center`}
            >
                <span className="text-emerald-600 font-light">
                    {fallback ? fallback[0].toUpperCase() : alt[0].toUpperCase()}
                </span>
            </div>
        )
    }

    return (
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden`}>
            <Image
                src={src}
                alt={alt}
                width={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
                height={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
                className="object-cover"
                onError={() => setError(true)}
            />
        </div>
    )
} 