
import type { Expense, Budget, Category } from '@/types/expense'
import { DEFAULT_CATEGORIES } from './constants'

const STORAGE_KEYS = {
  expenses: 'daily_amt_expenses',
  budgets: 'daily_amt_budgets',
  categories: 'daily_amt_categories',
  version: 'daily_amt_version',
}

const DATA_VERSION = 1

// Initialize/Migrate Data
export const migrateData = () => {
  try {
    if (typeof window !== 'undefined') {
      const currentVersion = localStorage.getItem(STORAGE_KEYS.version)

      if (!currentVersion || parseInt(currentVersion) < DATA_VERSION) {
        console.log('Migrating data to version', DATA_VERSION)

        // Initialize categories if they don't exist
        const existingCategories = localStorage.getItem(STORAGE_KEYS.categories)
        if (!existingCategories) {
          const categories = DEFAULT_CATEGORIES.map(cat => ({
            ...cat,
            id: Date.now().toString() + Math.random(),
            createdAt: Date.now(),
          }))
          localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories))
        }

        localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION.toString())
      }
    }
  } catch (error) {
    console.error('Error migrating data:', error)
  }
}

// ============ EXPENSE OPERATIONS ============

export const getExpenses = (): Expense[] => {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEYS.expenses)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading expenses:', error)
    return []
  }
}

export const saveExpense = (expense: Expense): void => {
  if (typeof window === 'undefined') return

  try {
    const expenses = getExpenses()
    expenses.push(expense)
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses))
  } catch (error) {
    console.error('Error saving expense:', error)
    throw error
  }
}

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  if (typeof window === 'undefined') return

  try {
    const expenses = getExpenses()
    const index = expenses.findIndex(e => e.id === id)

    if (index !== -1) {
      expenses[index] = { ...expenses[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(expenses))
    }
  } catch (error) {
    console.error('Error updating expense:', error)
    throw error
  }
}


export const deleteExpense = (id: string): void => {
  if (typeof window === 'undefined') return

  try {
    const expenses = getExpenses()
    const filtered = expenses.filter((e) => e.id !== id)
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting expense:', error)
    throw error
  }
}

export const clearAllExpenses = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.expenses)
  } catch (error) {
    console.error('Error clearing expenses:', error)
    throw error
  }
}

// ============ BUDGET OPERATIONS ============

export const getBudgets = (): Budget[] => {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEYS.budgets)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading budgets:', error)
    return []
  }
}

export const saveBudget = (budget: Budget): void => {
  if (typeof window === 'undefined') return

  try {
    const budgets = getBudgets()
    budgets.push(budget)
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets))
  } catch (error) {
    console.error('Error saving budget:', error)
    throw error
  }
}

export const updateBudget = (id: string, updates: Partial<Budget>): void => {
  if (typeof window === 'undefined') return

  try {
    const budgets = getBudgets()
    const index = budgets.findIndex(b => b.id === id)

    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets))
    }
  } catch (error) {
    console.error('Error updating budget:', error)
    throw error
  }
}

export const deleteBudget = (id: string): void => {
  if (typeof window === 'undefined') return

  try {
    const budgets = getBudgets()
    const filtered = budgets.filter(b => b.id !== id)
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting budget:', error)
    throw error
  }
}

// ============ CATEGORY OPERATIONS ============

export const getCategories = (): Category[] => {
  if (typeof window === 'undefined') return []

  try {
    const data = localStorage.getItem(STORAGE_KEYS.categories)
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('Error reading categories:', error)
    return []
  }
}

export const saveCategory = (category: Category): void => {
  if (typeof window === 'undefined') return

  try {
    const categories = getCategories()
    categories.push(category)
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories))
  } catch (error) {
    console.error('Error saving category:', error)
    throw error
  }
}

export const updateCategory = (id: string, updates: Partial<Category>): void => {
  if (typeof window === 'undefined') return

  try {
    const categories = getCategories()
    const index = categories.findIndex(c => c.id === id)

    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates }
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(categories))
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export const deleteCategory = (id: string): void => {
  if (typeof window === 'undefined') return

  try {
    const categories = getCategories()
    const category = categories.find(c => c.id === id)

    // Prevent deletion of default categories
    if (category?.isDefault) {
      throw new Error('Cannot delete default categories')
    }

    const filtered = categories.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// ============ BULK OPERATIONS ============

export const importExpenses = (expenses: Expense[]): void => {
  if (typeof window === 'undefined') return

  try {
    const existing = getExpenses()
    const merged = [...existing, ...expenses]
    localStorage.setItem(STORAGE_KEYS.expenses, JSON.stringify(merged))
  } catch (error) {
    console.error('Error importing expenses:', error)
    throw error
  }
}

export const exportAllData = (): { expenses: Expense[], budgets: Budget[], categories: Category[] } => {
  return {
    expenses: getExpenses(),
    budgets: getBudgets(),
    categories: getCategories(),
  }
}

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_KEYS.expenses)
    localStorage.removeItem(STORAGE_KEYS.budgets)
    localStorage.removeItem(STORAGE_KEYS.categories)
    localStorage.removeItem(STORAGE_KEYS.version)
  } catch (error) {
    console.error('Error clearing all data:', error)
    throw error
  }
}


