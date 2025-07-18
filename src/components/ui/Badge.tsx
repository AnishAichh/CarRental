import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info'
type BadgeSize = 'sm' | 'md' | 'lg'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    size?: BadgeSize
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center font-light rounded-full'

        const variants = {
            default: 'bg-emerald-50 text-emerald-800',
            success: 'bg-emerald-100 text-emerald-800',
            error: 'bg-red-100 text-red-800',
            warning: 'bg-yellow-100 text-yellow-800',
            info: 'bg-emerald-50 text-emerald-800',
        }

        const sizes = {
            sm: 'px-2 py-0.5 text-xs',
            md: 'px-2.5 py-0.5 text-sm',
            lg: 'px-3 py-1 text-base',
        }

        return (
            <span
                ref={ref}
                className={twMerge(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            >
                {children}
            </span>
        )
    }
)

Badge.displayName = 'Badge'

export default Badge 