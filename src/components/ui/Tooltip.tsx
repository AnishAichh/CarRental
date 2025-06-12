import { HTMLAttributes, forwardRef } from 'react'
import { twMerge } from 'tailwind-merge'

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
    content: string
    position?: 'top' | 'right' | 'bottom' | 'left'
    className?: string
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
    ({ className, content, position = 'top', children, ...props }, ref) => {
        const positions = {
            top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
            right: 'left-full top-1/2 -translate-y-1/2 ml-2',
            bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
            left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        }

        return (
            <div className="group relative inline-block" ref={ref} {...props}>
                {children}
                <div
                    className={twMerge(
                        'invisible absolute z-50 rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-all group-hover:visible group-hover:opacity-100',
                        positions[position],
                        className
                    )}
                >
                    {content}
                    <div
                        className={twMerge(
                            'absolute h-2 w-2 rotate-45 bg-gray-900',
                            position === 'top' && 'bottom-[-4px] left-1/2 -translate-x-1/2',
                            position === 'right' && 'left-[-4px] top-1/2 -translate-y-1/2',
                            position === 'bottom' && 'top-[-4px] left-1/2 -translate-x-1/2',
                            position === 'left' && 'right-[-4px] top-1/2 -translate-y-1/2'
                        )}
                    />
                </div>
            </div>
        )
    }
)

Tooltip.displayName = 'Tooltip'

export default Tooltip 