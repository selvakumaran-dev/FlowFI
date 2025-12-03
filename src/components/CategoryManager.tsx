import { useExpense } from '@/context/ExpenseContext'
import type { Category } from '@/types/expense'
import { useState } from 'react'
import { Plus, Edit2, Trash2, Palette } from 'lucide-react'

const EMOJI_OPTIONS = ['🍔', '🚗', '🛍️', '💳', '🎬', '🏥', '📚', '📦', '✈️', '🏠', '⚡', '🎮', '🎨', '💰', '🎁', '☕', '🍕', '🚕']
const COLOR_OPTIONS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#6b7280']

export default function CategoryManager() {
    const { categories, addCategory, editCategory, deleteCategory } = useExpense()
    const [isAdding, setIsAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        icon: '📦',
        color: '#6b7280',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            alert('Please enter a category name')
            return
        }

        if (editingId) {
            editCategory(editingId, formData)
            setEditingId(null)
        } else {
            addCategory({
                ...formData,
                id: Date.now().toString(),
                isDefault: false,
                createdAt: Date.now(),
            })
        }

        setFormData({ name: '', icon: '📦', color: '#6b7280' })
        setIsAdding(false)
    }

    const handleEdit = (category: Category) => {
        setFormData({
            name: category.name,
            icon: category.icon,
            color: category.color,
        })
        setEditingId(category.id)
        setIsAdding(true)
    }

    const handleDelete = (category: Category) => {
        if (category.isDefault) {
            alert('Cannot delete default categories')
            return
        }

        if (confirm(`Delete "${category.name}" category? Expenses in this category will need to be recategorized.`)) {
            deleteCategory(category.id)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Category Management</h2>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {/* Add/Edit Form */}
            {isAdding && (
                <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Category Name
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Groceries, Gas, etc."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Icon
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {EMOJI_OPTIONS.map((emoji) => (
                                    <button
                                        key={emoji}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: emoji })}
                                        className={`w-10 h-10 text-2xl rounded-lg transition-all ${formData.icon === emoji
                                            ? 'bg-primary-600 scale-110'
                                            : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Color
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {COLOR_OPTIONS.map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color })}
                                        className={`w-10 h-10 rounded-lg transition-all ${formData.color === color ? 'ring-2 ring-primary-600 ring-offset-2 scale-110' : ''
                                            }`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            {editingId ? 'Update Category' : 'Create Category'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAdding(false)
                                setEditingId(null)
                                setFormData({ name: '', icon: '📦', color: '#6b7280' })
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Category List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                    <div
                        key={category.id}
                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                        style={{ borderLeftWidth: '4px', borderLeftColor: category.color }}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">{category.icon}</span>
                                <div>
                                    <h3 className="font-semibold text-gray-800 dark:text-white">
                                        {category.name}
                                    </h3>
                                    {category.isDefault && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Default</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                    aria-label="Edit category"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                {!category.isDefault && (
                                    <button
                                        onClick={() => handleDelete(category)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        aria-label="Delete category"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {categories.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No categories yet. Create your first category!</p>
                </div>
            )}
        </div>
    )
}
