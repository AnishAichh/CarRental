import { SelectHTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    fullWidth?: boolean
    options: Array<{
        value: string
        label: string
    }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, fullWidth = false, options, ...props }, ref) => {
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
                <select
                    ref={ref}
                    className={twMerge(baseStyles, errorStyles, className)}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${props.id}-error` : undefined}
                    {...props}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
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

Select.displayName = 'Select'

export default Select 