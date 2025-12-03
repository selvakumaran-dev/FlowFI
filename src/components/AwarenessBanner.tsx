import { calculateImpact, formatCurrency } from '@/lib/utils'
import { TrendingUp } from 'lucide-react'

interface AwarenessBannerProps {
    amount: number
}

export default function AwarenessBanner({ amount }: AwarenessBannerProps) {
    if (amount <= 0) return null

    const { monthly, yearly } = calculateImpact(amount)

    return (
        <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-fade-in">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-full">
                    <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                        ₹1 Awareness Mode
                    </h4>
                    <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">
                        <span className="font-semibold">{formatCurrency(amount)}</span> today becomes{' '}
                        <span className="font-bold">{formatCurrency(yearly)}</span> per year.
                    </p>
                    <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        (That's {formatCurrency(monthly)} per month!)
                    </p>
                </div>
            </div>
        </div>
    )
}
