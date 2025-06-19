import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string | number
    height?: string | number
    className?: string
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, variant = 'text', width, height, ...props }, ref) => {
        const baseStyles = 'animate-pulse bg-emerald-100'

        const variants = {
            text: 'rounded',
            circular: 'rounded-full',
            rectangular: 'rounded-none',
        }

        const style = {
            width: width,
            height: height,
        }

        return (
            <div
                ref={ref}
                className={twMerge(baseStyles, variants[variant], className)}
                style={style}
                {...props}
            />
        )
    }
)

Skeleton.displayName = 'Skeleton'

export default Skeleton 