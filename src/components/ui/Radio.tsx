import { InputHTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface RadioProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    fullWidth?: boolean
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, error, fullWidth = false, ...props }, ref) => {
        const baseStyles = 'h-4 w-4 border-emerald-300 text-emerald-600 focus:ring-emerald-500'
        const errorStyles = error ? 'border-red-300 text-red-900 focus:ring-red-500' : ''
        const width = fullWidth ? 'w-full' : ''

        return (
            <div className={width}>
                <div className="flex items-center">
                    <input
                        ref={ref}
                        type="radio"
                        className={twMerge(baseStyles, errorStyles, className)}
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? `${props.id}-error` : undefined}
                        {...props}
                    />
                    {label && (
                        <label
                            htmlFor={props.id}
                            className="ml-2 block text-sm font-light text-emerald-900"
                        >
                            {label}
                        </label>
                    )}
                </div>
                {error && (
                    <p
                        className="mt-1 text-sm text-red-600"
                        id={`${props.id}-error`}
                    >
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Radio.displayName = 'Radio'

export default Radio 