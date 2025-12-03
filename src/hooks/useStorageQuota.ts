import { useState, useEffect } from 'react'

interface StorageQuota {
    usage: number
    quota: number
    percentage: number
    usageFormatted: string
    quotaFormatted: string
}

export function useStorageQuota(): StorageQuota {
    const [quota, setQuota] = useState<StorageQuota>({
        usage: 0,
        quota: 0,
        percentage: 0,
        usageFormatted: '0 B',
        quotaFormatted: '0 B',
    })

    useEffect(() => {
        const calculateUsage = () => {
            let total = 0
            for (const key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += (localStorage[key].length + key.length) * 2 // UTF-16 characters are 2 bytes
                }
            }

            // Estimate quota (usually 5MB = 5 * 1024 * 1024 bytes)
            // Some browsers allow more, but 5MB is a safe lower bound for warnings
            const estimatedQuota = 5 * 1024 * 1024

            setQuota({
                usage: total,
                quota: estimatedQuota,
                percentage: (total / estimatedQuota) * 100,
                usageFormatted: formatBytes(total),
                quotaFormatted: formatBytes(estimatedQuota),
            })
        }

        calculateUsage()
        // Recalculate on storage events (changes from other tabs)
        window.addEventListener('storage', calculateUsage)
        // Also recalculate periodically or when data changes (could be optimized)
        const interval = setInterval(calculateUsage, 5000)

        return () => {
            window.removeEventListener('storage', calculateUsage)
            clearInterval(interval)
        }
    }, [])

    return quota
}

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}
