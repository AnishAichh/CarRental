import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'bordered'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const baseStyles = 'bg-white bg-gradient-to-br from-emerald-50/60 via-white to-emerald-100/40 rounded-lg shadow font-light'

        const variants = {
            default: '',
            bordered: 'border border-gray-200',
        }

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        }

        return (
            <div
                ref={ref}
                className={twMerge(baseStyles, variants[variant], paddings[padding], className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export default Card 