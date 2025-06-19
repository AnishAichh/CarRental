import { InputHTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface DatePickerProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    fullWidth?: boolean
}

const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
    ({ className, label, error, fullWidth = false, ...props }, ref) => {
        const baseStyles = 'block w-full rounded-md border-emerald-200 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm font-light'
        const errorStyles = error ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500' : ''
        const width = fullWidth ? 'w-full' : ''

        return (
            <div className={width}>
                {label && (
                    <label
                        htmlFor={props.id}
                        className="block text-sm font-light text-emerald-700 mb-1"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type="date"
                    className={twMerge(baseStyles, errorStyles, className)}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${props.id}-error` : undefined}
                    {...props}
                />
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

DatePicker.displayName = 'DatePicker'

export default DatePicker 