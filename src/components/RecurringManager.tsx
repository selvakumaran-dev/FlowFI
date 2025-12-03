import { useExpense } from '@/context/ExpenseContext'
import type { Expense } from '@/types/expense'
import { Repeat, Calendar, Play, Pause, Trash2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { getRecurringDescription } from '@/lib/recurring'

export default function RecurringManager() {
    const { expenses, editExpense, deleteExpense } = useExpense()
    // Get only recurring expense templates (not generated instances)
    const recurringTemplates = expenses.filter(e => e.isRecurring && !e.parentRecurringId)

    const togglePause = (expense: Expense) => {
        // We'll use a custom field to track paused state
        const isPaused = (expense as any).isPaused || false
        editExpense(expense.id, { ...(expense as any), isPaused: !isPaused })
    }

    const handleDelete = (expense: Expense) => {
        if (confirm(`Delete recurring expense "${expense.description}"? This will not delete already generated instances.`)) {
            deleteExpense(expense.id)
        }
    }

    if (recurringTemplates.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <Repeat className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 dark:text-gray-400">
                    No recurring expenses set up yet.
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Create an expense and enable "Make this a recurring expense" to get started.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Recurring Expenses</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {recurringTemplates.length} recurring {recurringTemplates.length === 1 ? 'expense' : 'expenses'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {recurringTemplates.map((expense) => {
                    const isPaused = (expense as any).isPaused || false
                    const description = getRecurringDescription(expense)

                    return (
                        <div
                            key={expense.id}
                            className={`p-4 border-2 rounded-lg transition-all ${isPaused
                                ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 opacity-60'
                                : 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Repeat className={`w-5 h-5 ${isPaused ? 'text-gray-400' : 'text-purple-600 dark:text-purple-400'}`} />
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {expense.description}
                                        </h3>
                                        {isPaused && (
                                            <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium">
                                                Paused
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                {formatCurrency(expense.amount)}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                {expense.category}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white capitalize">
                                                {expense.recurringFrequency}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">Started:</span>
                                            <span className="ml-2 font-semibold text-gray-800 dark:text-white">
                                                {format(parseISO(expense.date), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    </div>

                                    {expense.recurringEndDate && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                Ends on {format(parseISO(expense.recurringEndDate), 'MMM dd, yyyy')}
                                            </span>
                                        </div>
                                    )}

                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        {description}
                                    </p>

                                    {expense.notes && (
                                        <p className="mt-2 text-sm italic text-gray-600 dark:text-gray-400">
                                            Note: {expense.notes}
                                        </p>
                                    )}
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => togglePause(expense)}
                                        className={`p-2 rounded-lg transition-colors ${isPaused
                                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                            : 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                            }`}
                                        title={isPaused ? 'Resume' : 'Pause'}
                                    >
                                        {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(expense)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Tip:</strong> Paused recurring expenses won't generate new instances. Already generated expenses remain unchanged.
                </p>
            </div>
        </div>
    )
}
