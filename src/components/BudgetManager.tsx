import type { Budget } from '@/types/expense'
import { useState } from 'react'
import { Plus, Edit2, Trash2, TrendingUp, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

import { useExpense } from '@/context/ExpenseContext'
import { calculateStats } from '@/lib/utils'

export default function BudgetManager() {
    const { budgets, expenses, categories, addBudget, editBudget, deleteBudget } = useExpense()

    // Calculate budget status
    const stats = calculateStats(expenses, budgets)
    const budgetStatus = stats.budgetStatus

    const categoryNames = categories.map(c => c.name)

    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        category: categoryNames[0] || 'Other',
        monthlyLimit: '',
        alertThreshold: '80',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.category || !formData.monthlyLimit) return

        const budgetData = {
            category: formData.category,
            monthlyLimit: parseFloat(formData.monthlyLimit),
            alertThreshold: parseInt(formData.alertThreshold),
            isActive: true,
        }

        if (editingId) {
            editBudget(editingId, budgetData)
            setEditingId(null)
        } else {
            addBudget({
                ...budgetData,
                id: Date.now().toString(),
                createdAt: Date.now()
            })
        }

        setFormData({ category: categoryNames[0] || 'Other', monthlyLimit: '', alertThreshold: '80' })
        setIsAdding(false)
    }

    const handleEdit = (budget: Budget) => {
        setFormData({
            category: budget.category,
            monthlyLimit: budget.monthlyLimit.toString(),
            alertThreshold: budget.alertThreshold.toString(),
        })
        setEditingId(budget.id)
        setIsAdding(true)
    }

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-red-500'
        if (percentage >= 80) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return 'text-red-600 dark:text-red-400'
        if (percentage >= 80) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-green-600 dark:text-green-400'
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Budget Management</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Budget
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                {categoryNames.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Monthly Limit (₹)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.monthlyLimit}
                                onChange={(e) => setFormData({ ...formData, monthlyLimit: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                placeholder="500.00"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Alert at (%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={formData.alertThreshold}
                                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {editingId ? 'Update Budget' : 'Create Budget'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false)
                                setEditingId(null)
                                setFormData({ category: categoryNames[0] || 'Other', monthlyLimit: '', alertThreshold: '80' })
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Budget List */}
            <div className="space-y-4">
                {budgets.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No budgets set yet. Create your first budget to start tracking!</p>
                    </div>
                ) : (
                    budgets.map((budget) => {
                        const status = budgetStatus[budget.category]
                        const percentage = status?.percentage || 0

                        return (
                            <div
                                key={budget.id}
                                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                            {budget.category}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Monthly limit: {formatCurrency(budget.monthlyLimit)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(budget)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            aria-label="Edit budget"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to delete this budget?')) {
                                                    deleteBudget(budget.id)
                                                }
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            aria-label="Delete budget"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {status && (
                                    <>
                                        <div className="mb-2">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className={`font-medium ${getStatusColor(percentage)}`}>
                                                    {formatCurrency(status.spent)} spent
                                                </span>
                                                <span className="text-gray-600 dark:text-gray-400">
                                                    {formatCurrency(status.remaining)} remaining
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getProgressColor(percentage)} transition-all duration-300`}
                                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className={`font-medium ${getStatusColor(percentage)}`}>
                                                {percentage.toFixed(1)}% used
                                            </span>
                                            {percentage >= budget.alertThreshold && (
                                                <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                                                    <AlertTriangle className="w-4 h-4" />
                                                    Alert threshold reached
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
