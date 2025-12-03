import { useState } from 'react'
import { Plus, Mic, X } from 'lucide-react'

interface FloatingActionMenuProps {
    onAddExpense: () => void
    onVoiceEntry: () => void
}

export default function FloatingActionMenu({ onAddExpense, onVoiceEntry }: FloatingActionMenuProps) {
    const [isOpen, setIsOpen] = useState(false)

    const toggleMenu = () => setIsOpen(!isOpen)

    return (
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50">
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10 animate-fade-in"
                    onClick={toggleMenu}
                />
            )}

            {/* Action Buttons - Appear when menu is open */}
            <div className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}>
                {/* Voice Entry Button */}
                <button
                    onClick={() => {
                        onVoiceEntry()
                        setIsOpen(false)
                    }}
                    className="group relative flex items-center gap-3 transition-all duration-200"
                    style={{ transitionDelay: isOpen ? '50ms' : '0ms' }}
                >
                    <span className="absolute right-14 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        Voice Entry
                    </span>
                    <div className="w-12 h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110">
                        <Mic className="w-5 h-5" />
                    </div>
                </button>

                {/* Add Expense Button */}
                <button
                    onClick={() => {
                        onAddExpense()
                        setIsOpen(false)
                    }}
                    className="group relative flex items-center gap-3 transition-all duration-200"
                    style={{ transitionDelay: isOpen ? '100ms' : '0ms' }}
                >
                    <span className="absolute right-14 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                        Add Expense
                    </span>
                    <div className="w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-110">
                        <Plus className="w-5 h-5" />
                    </div>
                </button>
            </div>

            {/* Main FAB Button */}
            <button
                onClick={toggleMenu}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-45 scale-110'
                        : 'bg-gradient-to-br from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 hover:scale-110'
                    }`}
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <div className="relative">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        <div className="absolute inset-0 w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                )}
            </button>

            {/* Ripple effect on click */}
            {isOpen && (
                <div className="absolute inset-0 rounded-full bg-primary-400 animate-ping opacity-75" />
            )}
        </div>
    )
}
