import { Tab } from '@headlessui/react'
import { twMerge } from 'tailwind-merge'

interface TabsProps {
    tabs: Array<{
        label: string
        content: React.ReactNode
    }>
    defaultIndex?: number
    onChange?: (index: number) => void
    className?: string
}

export default function Tabs({
    tabs,
    defaultIndex = 0,
    onChange,
    className,
}: TabsProps) {
    return (
        <Tab.Group defaultIndex={defaultIndex} onChange={onChange}>
            <Tab.List className={twMerge('flex space-x-1 rounded-xl bg-emerald-900/10 p-1', className)}>
                {tabs.map((tab, index) => (
                    <Tab
                        key={index}
                        className={({ selected }) =>
                            twMerge(
                                'w-full rounded-lg py-2.5 text-sm font-light leading-5',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2',
                                selected
                                    ? 'bg-white text-emerald-700 shadow'
                                    : 'text-emerald-400 hover:bg-white/[0.12] hover:text-emerald-700'
                            )
                        }
                    >
                        {tab.label}
                    </Tab>
                ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
                {tabs.map((tab, index) => (
                    <Tab.Panel
                        key={index}
                        className={twMerge(
                            'rounded-xl bg-white p-3',
                            'ring-white ring-opacity-60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2'
                        )}
                    >
                        {tab.content}
                    </Tab.Panel>
                ))}
            </Tab.Panels>
        </Tab.Group>
    )
} 