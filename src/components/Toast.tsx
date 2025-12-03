'use client'

import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export interface ToastMessage {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    title: string
    message?: string
    duration?: number
}

interface ToastProps {
    toasts: ToastMessage[]
    onRemove: (id: string) => void
}

const iconMap = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
}

const colorMap = {
    success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
    error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200',
    info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200',
}

export default function Toast({ toasts, onRemove }: ToastProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
            ))}
        </div>
    )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    const [progress, setProgress] = useState(100)
    const Icon = iconMap[toast.type]
    const duration = toast.duration || 5000

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                const newProgress = prev - (100 / (duration / 100))
                return newProgress <= 0 ? 0 : newProgress
            })
        }, 100)

        return () => clearInterval(interval)
    }, [duration])

    // Separate effect to handle removal when progress reaches 0
    useEffect(() => {
        if (progress <= 0) {
            onRemove(toast.id)
        }
    }, [progress, toast.id, onRemove])

    return (
        <div
            className={`${colorMap[toast.type]} border rounded-lg shadow-lg p-4 animate-slide-in-right`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{toast.title}</p>
                    {toast.message && (
                        <p className="text-sm opacity-90 mt-1">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={() => onRemove(toast.id)}
                    className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="mt-2 h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-current transition-all duration-100 ease-linear"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}

// Hook for using toasts
export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([])

    const addToast = (toast: Omit<ToastMessage, 'id'>) => {
        const id = Date.now().toString() + Math.random()
        setToasts((prev) => [...prev, { ...toast, id }])
    }

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const showSuccess = (title: string, message?: string) => {
        addToast({ type: 'success', title, message })
    }

    const showError = (title: string, message?: string) => {
        addToast({ type: 'error', title, message })
    }

    const showWarning = (title: string, message?: string) => {
        addToast({ type: 'warning', title, message })
    }

    const showInfo = (title: string, message?: string) => {
        addToast({ type: 'info', title, message })
    }

    return {
        toasts,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    }
}
