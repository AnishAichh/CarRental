import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
    value: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
    variant?: 'default' | 'success' | 'error' | 'warning'
    showValue?: boolean
    className?: string
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, value, max = 100, size = 'md', variant = 'default', showValue = false, ...props }, ref) => {
        const sizes = {
            sm: 'h-1',
            md: 'h-2',
            lg: 'h-4',
        }

        const variants = {
            default: 'bg-emerald-600',
            success: 'bg-emerald-600',
            error: 'bg-red-600',
            warning: 'bg-yellow-600',
        }

        const percentage = Math.min(100, Math.max(0, (value / max) * 100))

        return (
            <div className="w-full" ref={ref} {...props}>
                <div className={twMerge('w-full bg-gray-200 rounded-full overflow-hidden', sizes[size], className)}>
                    <div
                        className={twMerge('transition-all duration-300 ease-in-out', variants[variant])}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                {showValue && (
                    <div className="mt-1 text-sm text-gray-600 text-right font-light">
                        {Math.round(percentage)}%
                    </div>
                )}
            </div>
        )
    }
)

Progress.displayName = 'Progress'

export default Progress 