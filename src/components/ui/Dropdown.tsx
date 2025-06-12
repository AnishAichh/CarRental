import { Fragment, ReactNode } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

interface DropdownItem {
    label: string
    onClick: () => void
    icon?: ReactNode
    danger?: boolean
}

interface DropdownProps {
    trigger: ReactNode
    items: DropdownItem[]
    align?: 'left' | 'right'
    className?: string
}

const Dropdown = ({ trigger, items, align = 'right', className }: DropdownProps) => {
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="outline-none">
                {trigger}
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items
                    className={twMerge(
                        'absolute z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
                        align === 'right' ? 'right-0' : 'left-0',
                        className
                    )}
                >
                    <div className="py-1">
                        {items.map((item, index) => (
                            <Menu.Item key={index}>
                                {({ active }: { active: boolean }) => (
                                    <button
                                        onClick={item.onClick}
                                        className={twMerge(
                                            'flex w-full items-center px-4 py-2 text-sm',
                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                            item.danger ? 'text-red-600 hover:bg-red-50' : ''
                                        )}
                                    >
                                        {item.icon && <span className="mr-3">{item.icon}</span>}
                                        {item.label}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}

export default Dropdown 