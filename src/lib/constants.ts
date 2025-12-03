import type { Category } from '@/types/expense'

// Default expense categories with icons and colors
export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt'>[] = [
    {
        name: 'Food',
        icon: '🍔',
        color: '#ef4444',
        isDefault: true,
    },
    {
        name: 'Transport',
        icon: '🚗',
        color: '#3b82f6',
        isDefault: true,
    },
    {
        name: 'Shopping',
        icon: '🛍️',
        color: '#a855f7',
        isDefault: true,
    },
    {
        name: 'Bills',
        icon: '💳',
        color: '#f59e0b',
        isDefault: true,
    },
    {
        name: 'Entertainment',
        icon: '🎬',
        color: '#ec4899',
        isDefault: true,
    },
    {
        name: 'Health',
        icon: '🏥',
        color: '#10b981',
        isDefault: true,
    },
    {
        name: 'Education',
        icon: '📚',
        color: '#6366f1',
        isDefault: true,
    },
    {
        name: 'Other',
        icon: '📦',
        color: '#6b7280',
        isDefault: true,
    },
]

// Chart colors for consistent theming
export const CHART_COLORS = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    neutral: '#6b7280',
}

export const CATEGORY_COLORS = [
    '#ef4444', '#f59e0b', '#10b981', '#3b82f6',
    '#6366f1', '#8b5cf6', '#ec4899', '#6b7280',
    '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
]

// Animation durations (in ms)
export const ANIMATION_DURATION = {
    fast: 150,
    normal: 300,
    slow: 500,
}

// Budget alert thresholds
export const BUDGET_THRESHOLDS = {
    warning: 80, // Show warning at 80%
    danger: 100, // Show danger at 100%
}

// Storage keys
export const STORAGE_KEYS = {
    expenses: 'daily_expenses',
    budgets: 'daily_budgets',
    categories: 'daily_categories',
    settings: 'daily_settings',
    version: 'daily_data_version',
}

// Current data version for migration
export const DATA_VERSION = 2
