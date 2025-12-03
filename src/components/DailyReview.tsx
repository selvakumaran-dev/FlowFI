import type { Expense } from '@/types/expense'
import type { DailyReviewData } from '@/lib/insights'
import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { saveDailyReview, shouldShowDailyReview } from '@/lib/insights'
import { formatCurrency } from '@/lib/utils'

interface DailyReviewProps {
    expenses: Expense[]
    onClose: () => void
}

export default function DailyReview({ expenses, onClose }: DailyReviewProps) {
    const [show, setShow] = useState(false)
    const [overallSpending, setOverallSpending] = useState<'good' | 'overspent'>('good')
    const [biggestCategory, setBiggestCategory] = useState('')
    const [mood, setMood] = useState<'happy' | 'neutral' | 'sad'>('neutral')

    useEffect(() => {
        // Check if review should be shown (after 8 PM and not done today)
        const hour = new Date().getHours()
        if (hour >= 20 && shouldShowDailyReview()) {
            setShow(true)
        }
    }, [])

    useEffect(() => {
        // Calculate biggest category
        const today = new Date().toISOString().split('T')[0]
        const todayExpenses = expenses.filter(e => e.date === today)

        const categoryTotals: Record<string, number> = {}
        todayExpenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount
        })

        const biggest = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
        if (biggest) {
            setBiggestCategory(biggest[0])
        }
    }, [expenses])

    const handleSubmit = () => {
        const today = new Date().toISOString().split('T')[0]
        const todayExpenses = expenses.filter(e => e.date === today)
        const totalSpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0)

        const review: DailyReviewData = {
            date: today,
            overallSpending,
            biggestCategory,
            mood,
            totalSpent,
        }

        saveDailyReview(review)
        setShow(false)
        onClose()
    }

    if (!show) return null

    const today = new Date().toISOString().split('T')[0]
    const todayExpenses = expenses.filter(e => e.date === today)
    const totalSpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0)

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">End-of-Day Review</h2>
                    <button
                        onClick={() => {
                            setShow(false)
                            onClose()
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Today's Total */}
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 mb-1">Today's Total</p>
                        <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                            {formatCurrency(totalSpent)}
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                            {todayExpenses.length} transaction{todayExpenses.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    {/* Overall Spending */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            How was your spending today?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setOverallSpending('good')}
                                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${overallSpending === 'good'
                                        ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <TrendingDown className="w-5 h-5" />
                                <span className="font-medium">Good</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setOverallSpending('overspent')}
                                className={`flex items-center justify-center gap-2 p-4 rounded-lg border transition-all ${overallSpending === 'overspent'
                                        ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <TrendingUp className="w-5 h-5" />
                                <span className="font-medium">Overspent</span>
                            </button>
                        </div>
                    </div>

                    {/* Mood Selector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            How do you feel about it?
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setMood('happy')}
                                className={`p-4 rounded-lg border transition-all text-4xl ${mood === 'happy'
                                        ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800 scale-110'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                😄
                            </button>
                            <button
                                type="button"
                                onClick={() => setMood('neutral')}
                                className={`p-4 rounded-lg border transition-all text-4xl ${mood === 'neutral'
                                        ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 scale-110'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                😐
                            </button>
                            <button
                                type="button"
                                onClick={() => setMood('sad')}
                                className={`p-4 rounded-lg border transition-all text-4xl ${mood === 'sad'
                                        ? 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800 scale-110'
                                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                😟
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg font-medium"
                    >
                        Save Review
                    </button>
                </div>
            </div>
        </div>
    )
}
