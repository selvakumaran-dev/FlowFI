import type { Category } from '@/types/expense'
import { useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'

interface SearchFilterProps {
    categories: Category[]
    onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
    searchQuery: string
    selectedCategories: string[]
    dateFrom: string
    dateTo: string
    amountMin: string
    amountMax: string
    selectedTags: string[]
    sortBy: 'date' | 'amount' | 'category'
    sortOrder: 'asc' | 'desc'
}

export default function SearchFilter({ categories, onFilterChange }: SearchFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [filters, setFilters] = useState<FilterState>({
        searchQuery: '',
        selectedCategories: [],
        dateFrom: '',
        dateTo: '',
        amountMin: '',
        amountMax: '',
        selectedTags: [],
        sortBy: 'date',
        sortOrder: 'desc',
    })

    const updateFilters = (updates: Partial<FilterState>) => {
        const newFilters = { ...filters, ...updates }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }

    const clearFilters = () => {
        const emptyFilters: FilterState = {
            searchQuery: '',
            selectedCategories: [],
            dateFrom: '',
            dateTo: '',
            amountMin: '',
            amountMax: '',
            selectedTags: [],
            sortBy: 'date',
            sortOrder: 'desc',
        }
        setFilters(emptyFilters)
        onFilterChange(emptyFilters)
    }

    const hasActiveFilters =
        filters.searchQuery ||
        filters.selectedCategories.length > 0 ||
        filters.dateFrom ||
        filters.dateTo ||
        filters.amountMin ||
        filters.amountMax

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-6">
            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={filters.searchQuery}
                        onChange={(e) => updateFilters({ searchQuery: e.target.value })}
                        placeholder="Search expenses by description..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${isExpanded ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                >
                    <SlidersHorizontal className="w-5 h-5" />
                </button>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            {/* Advanced Filters */}
            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-slide-up">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Categories
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        const selected = filters.selectedCategories.includes(cat.name)
                                        updateFilters({
                                            selectedCategories: selected
                                                ? filters.selectedCategories.filter((c) => c !== cat.name)
                                                : [...filters.selectedCategories, cat.name],
                                        })
                                    }}
                                    className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.selectedCategories.includes(cat.name)
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    {cat.icon} {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                From Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                To Date
                            </label>
                            <input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => updateFilters({ dateTo: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Amount Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Min Amount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={filters.amountMin}
                                onChange={(e) => updateFilters({ amountMin: e.target.value })}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Amount ($)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                value={filters.amountMax}
                                onChange={(e) => updateFilters({ amountMax: e.target.value })}
                                placeholder="1000.00"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Sort By
                            </label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => updateFilters({ sortBy: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="date">Date</option>
                                <option value="amount">Amount</option>
                                <option value="category">Category</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Order
                            </label>
                            <select
                                value={filters.sortOrder}
                                onChange={(e) => updateFilters({ sortOrder: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                            >
                                <option value="desc">Newest First</option>
                                <option value="asc">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {filters.searchQuery && (
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-sm">
                            Search: "{filters.searchQuery}"
                        </span>
                    )}
                    {filters.selectedCategories.length > 0 && (
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-sm">
                            {filters.selectedCategories.length} categories
                        </span>
                    )}
                    {(filters.dateFrom || filters.dateTo) && (
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-sm">
                            Date range
                        </span>
                    )}
                    {(filters.amountMin || filters.amountMax) && (
                        <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-sm">
                            Amount range
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}
