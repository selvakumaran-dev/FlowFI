import type { Expense } from '@/types/expense'
import { useState } from 'react'
import { Download, Trash2, Edit2, Repeat, ChevronUp, ChevronDown, Camera, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { formatCurrency, exportToCSV, downloadFile } from '@/lib/utils'
import { getReceipt } from '@/lib/db'

import { useExpense } from '@/context/ExpenseContext'

const categoryColors: Record<string, string> = {
    Food: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    Transport: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    Entertainment: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    Shopping: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    Bills: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    Health: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    Other: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export default function ExpenseList() {
    const { expenses, categories, deleteExpense, editExpense } = useExpense()
    const [expandedId, setExpandedId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
    const [editForm, setEditForm] = useState<Partial<Expense>>({})
    const [viewingReceipt, setViewingReceipt] = useState<string | null>(null)
    const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
    const [visibleCount, setVisibleCount] = useState(20)

    const handleSelectAll = () => {
        if (selectedIds.size === expenses.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(expenses.map(e => e.id)))
        }
    }

    const handleSelectOne = (id: string) => {
        const newSelected = new Set(selectedIds)
        if (newSelected.has(id)) {
            newSelected.delete(id)
        } else {
            newSelected.add(id)
        }
        setSelectedIds(newSelected)
    }

    const handleBulkDelete = () => {
        if (confirm(`Delete ${selectedIds.size} selected expenses?`)) {
            selectedIds.forEach(id => deleteExpense(id))
            setSelectedIds(new Set())
        }
    }

    const handleBulkExport = () => {
        const selectedExpenses = expenses.filter(e => selectedIds.has(e.id))
        const csv = exportToCSV(selectedExpenses)
        downloadFile(csv, `selected_expenses_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv')
    }

    const startEdit = (expense: Expense) => {
        setEditingId(expense.id)
        setEditForm(expense)
    }

    const saveEdit = () => {
        if (editingId && editForm.amount && editForm.description && editForm.category && editForm.date) {
            editExpense(editingId, editForm)
            setEditingId(null)
            setEditForm({})
        }
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditForm({})
    }

    const handleViewReceipt = async (receiptId: string) => {
        try {
            const blob = await getReceipt(receiptId)
            if (blob) {
                const url = URL.createObjectURL(blob)
                setReceiptUrl(url)
                setViewingReceipt(receiptId)
            } else {
                alert('Receipt image not found')
            }
        } catch (error) {
            console.error('Error fetching receipt:', error)
            alert('Could not load receipt')
        }
    }

    const closeReceiptModal = () => {
        if (receiptUrl) {
            URL.revokeObjectURL(receiptUrl)
        }
        setReceiptUrl(null)
        setViewingReceipt(null)
    }

    if (expenses.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No expenses yet. Add your first expense!</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Expenses</h2>
                        {selectedIds.size > 0 && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedIds.size} selected
                            </span>
                        )}
                    </div>

                    {/* Bulk Actions */}
                    {selectedIds.size > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleBulkExport}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Download className="w-4 h-4" />
                                Export Selected
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected
                            </button>
                        </div>
                    )}
                </div>

                {/* Select All */}
                {expenses.length > 0 && (
                    <label className="flex items-center gap-2 mt-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedIds.size === expenses.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Select All</span>
                    </label>
                )}
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[600px] overflow-y-auto">
                {expenses
                    .sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime())
                    .slice(0, visibleCount)
                    .map((expense) => (
                        <div
                            key={expense.id}
                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedIds.has(expense.id) ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                }`}
                        >
                            {editingId === expense.id ? (
                                // Edit Mode
                                <div className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editForm.amount}
                                            onChange={(e) => setEditForm({ ...editForm, amount: parseFloat(e.target.value) })}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="Amount"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.description}
                                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                            placeholder="Description"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.name}>
                                                    {cat.icon} {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="date"
                                            value={editForm.date}
                                            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                                        />
                                    </div>
                                    <textarea
                                        value={editForm.notes || ''}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white resize-none"
                                        placeholder="Notes (optional)"
                                        rows={2}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={saveEdit}
                                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(expense.id)}
                                            onChange={() => handleSelectOne(expense.id)}
                                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-800 dark:text-white">
                                                    {expense.description}
                                                </h3>
                                                <span
                                                    className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[expense.category] || categoryColors.Other
                                                        }`}
                                                >
                                                    {expense.category}
                                                </span>
                                                {expense.isRecurring && (
                                                    <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                                                        <Repeat className="w-3 h-3" />
                                                        Recurring
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span>{format(parseISO(expense.date), 'MMM dd, yyyy')}</span>
                                                {expense.notes && (
                                                    <button
                                                        onClick={() => setExpandedId(expandedId === expense.id ? null : expense.id)}
                                                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                                                    >
                                                        {expandedId === expense.id ? (
                                                            <>
                                                                <ChevronUp className="w-4 h-4" />
                                                                Hide notes
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ChevronDown className="w-4 h-4" />
                                                                Show notes
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                            {expandedId === expense.id && expense.notes && (
                                                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                                    {expense.notes}
                                                </div>
                                            )}
                                            {expense.receiptId && (
                                                <button
                                                    onClick={() => handleViewReceipt(expense.receiptId!)}
                                                    className="mt-2 flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                                                >
                                                    <Camera className="w-3 h-3" />
                                                    View Receipt
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <p className="text-lg font-bold text-gray-800 dark:text-white">
                                            {formatCurrency(expense.amount)}
                                        </p>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => startEdit(expense)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                aria-label="Edit expense"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteExpense(expense.id)}
                                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                aria-label="Delete expense"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                {visibleCount < expenses.length && (
                    <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 20)}
                            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                        >
                            Load More ({expenses.length - visibleCount} remaining)
                        </button>
                    </div>
                )}
            </div>

            {/* Receipt Modal */}
            {viewingReceipt && receiptUrl && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={closeReceiptModal}>
                    <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
                        <button
                            onClick={closeReceiptModal}
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <img
                            src={receiptUrl}
                            alt="Receipt"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
