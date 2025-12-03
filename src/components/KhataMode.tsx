import type { Expense } from '@/types/expense'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KhataModeProps {
    onAdd: (expense: Expense) => void
    expenses: Expense[]
}

export default function KhataMode({ onAdd, expenses }: KhataModeProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [amount, setAmount] = useState('')
    const [note, setNote] = useState('')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!amount) {
            alert('कृपया राशि दर्ज करें (Please enter amount)')
            return
        }

        const expense: Expense = {
            id: Date.now().toString() + Math.random(),
            amount: parseFloat(amount),
            description: note || 'खर्च (Expense)',
            category: 'Other',
            date: new Date().toISOString().split('T')[0],
            createdAt: Date.now(),
            classification: 'ESSENTIAL',
        }

        onAdd(expense)

        setAmount('')
        setNote('')
        setIsOpen(false)
    }

    const todayTotal = expenses
        .filter(e => e.date === new Date().toISOString().split('T')[0])
        .reduce((sum, e) => sum + e.amount, 0)

    if (!isOpen) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-2xl mx-auto mb-8">
                    <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                        खाता बही
                    </h1>
                    <p className="text-3xl text-gray-600 dark:text-gray-400">Khata Book</p>
                </div>

                <div className="max-w-2xl mx-auto mb-8 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
                    <p className="text-2xl text-gray-600 dark:text-gray-400 mb-2">आज का कुल (Today's Total)</p>
                    <p className="text-6xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(todayTotal)}
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="w-full p-8 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl shadow-lg transition-all duration-200 hover:scale-105"
                    >
                        <Plus className="w-12 h-12 mx-auto mb-2" />
                        <span className="text-3xl font-bold block">नया खर्च जोड़ें</span>
                        <span className="text-xl block mt-1">Add New Expense</span>
                    </button>
                </div>

                <div className="max-w-2xl mx-auto mt-8">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        हाल के खर्च (Recent)
                    </h2>
                    <div className="space-y-3">
                        {expenses.slice(0, 5).map((expense) => (
                            <div
                                key={expense.id}
                                className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-2xl font-medium text-gray-900 dark:text-white">
                                            {expense.description}
                                        </p>
                                        <p className="text-xl text-gray-500 dark:text-gray-400 mt-1">
                                            {new Date(expense.date).toLocaleDateString('hi-IN')}
                                        </p>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">नया खर्च</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-10 h-10" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                        <label className="block text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            राशि (Amount) *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-full px-8 py-6 text-4xl border-4 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                            placeholder="₹ 0"
                            required
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            नोट (Note)
                        </label>
                        <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-8 py-6 text-3xl border-4 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                            placeholder="क्या खरीदा? (What did you buy?)"
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-8 py-6 text-2xl border-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold"
                        >
                            रद्द करें (Cancel)
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-8 py-6 text-2xl bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl font-bold"
                        >
                            जोड़ें (Add)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
