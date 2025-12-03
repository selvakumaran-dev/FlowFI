import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { Expense, Budget, Category } from '@/types/expense'
import {
    getExpenses,
    saveExpense,
    deleteExpense as deleteExpenseDb,
    updateExpense as updateExpenseDb,
    getBudgets,
    saveBudget,
    updateBudget as updateBudgetDb,
    deleteBudget as deleteBudgetDb,
    getCategories,
    saveCategory,
    updateCategory as updateCategoryDb,
    deleteCategory as deleteCategoryDb,
    migrateData,
    importExpenses
} from '@/lib/storage'
import { generateRecurringExpenses } from '@/lib/recurring'
import { useToast } from '@/components/Toast'
import { scheduleDailyReminder, showNotification } from '@/lib/notifications'
import { historyManager, createAddExpenseAction, createEditExpenseAction, createDeleteExpenseAction } from '@/lib/history'

interface ExpenseContextType {
    expenses: Expense[]
    budgets: Budget[]
    categories: Category[]
    loading: boolean
    addExpense: (expense: Expense) => Promise<void>
    editExpense: (id: string, updates: Partial<Expense>) => Promise<void>
    deleteExpense: (id: string) => Promise<void>
    addBudget: (budget: Budget) => Promise<void>
    editBudget: (id: string, updates: Partial<Budget>) => Promise<void>
    deleteBudget: (id: string) => Promise<void>
    addCategory: (category: Category) => Promise<void>
    editCategory: (id: string, updates: Partial<Category>) => Promise<void>
    deleteCategory: (id: string) => Promise<void>
    importData: (file: File) => Promise<void>
    refreshData: () => void
    undo: () => Promise<void>
    redo: () => Promise<void>
    canUndo: boolean
    canRedo: boolean
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

export function ExpenseProvider({ children }: { children: ReactNode }) {
    const [expenses, setExpenses] = useState<Expense[]>([])
    const [budgets, setBudgets] = useState<Budget[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    // Force re-render when history changes
    const [, setHistoryVersion] = useState(0)
    const { showSuccess, showError, showInfo } = useToast()

    const loadData = () => {
        try {
            setLoading(true)
            const loadedExpenses = getExpenses()
            const loadedBudgets = getBudgets()
            const loadedCategories = getCategories()

            // Generate recurring expenses
            const recurringExpenses = generateRecurringExpenses(loadedExpenses)
            if (recurringExpenses.length > 0) {
                recurringExpenses.forEach(exp => saveExpense(exp))
                const allExpenses = [...loadedExpenses, ...recurringExpenses]
                setExpenses(allExpenses)
                showInfo('Recurring Expenses Added', `${recurringExpenses.length} recurring expenses were automatically added`)
            } else {
                setExpenses(loadedExpenses)
            }

            setBudgets(loadedBudgets)
            setCategories(loadedCategories)
        } catch (error) {
            console.error('Failed to load data:', error)
            showError('Error', 'Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        migrateData()
        loadData()

        // Set up daily reminder
        const cleanup = scheduleDailyReminder(() => {
            showNotification('Daily Expense Reminder', {
                body: "Don't forget to track your expenses today!",
                tag: 'daily-reminder',
            })
        })

        return cleanup
    }, [])

    const refreshData = () => {
        loadData()
    }

    const addExpense = async (expense: Expense) => {
        try {
            await saveExpense(expense)
            setExpenses(prev => [expense, ...prev])
            historyManager.addAction(createAddExpenseAction(expense))
            setHistoryVersion(v => v + 1)
            showSuccess('Expense Added', `Added ${expense.description}`)
        } catch (error) {
            console.error('Failed to add expense:', error)
            showError('Error', 'Failed to save expense')
        }
    }

    const editExpense = async (id: string, updates: Partial<Expense>) => {
        try {
            const previous = expenses.find(e => e.id === id)
            if (!previous) return

            await updateExpenseDb(id, updates)
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e))
            historyManager.addAction(createEditExpenseAction(id, updates, previous))
            setHistoryVersion(v => v + 1)
            showSuccess('Expense Updated', 'Changes saved successfully')
        } catch (error) {
            console.error('Failed to update expense:', error)
            showError('Error', 'Failed to update expense')
        }
    }

    const deleteExpense = async (id: string) => {
        try {
            const expense = expenses.find(e => e.id === id)
            if (!expense) return

            await deleteExpenseDb(id)
            setExpenses(prev => prev.filter(e => e.id !== id))
            historyManager.addAction(createDeleteExpenseAction(expense))
            setHistoryVersion(v => v + 1)
            showSuccess('Expense Deleted', 'Expense removed successfully')
        } catch (error) {
            console.error('Failed to delete expense:', error)
            showError('Error', 'Failed to delete expense')
        }
    }

    const addBudget = async (budget: Budget) => {
        try {
            await saveBudget(budget)
            setBudgets(prev => [...prev, budget])
            showSuccess('Budget Set', `Budget set for ${budget.category}`)
        } catch (error) {
            console.error('Failed to add budget:', error)
            showError('Error', 'Failed to save budget')
        }
    }

    const editBudget = async (id: string, updates: Partial<Budget>) => {
        try {
            await updateBudgetDb(id, updates)
            setBudgets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b))
            showSuccess('Budget Updated', 'Budget updated successfully')
        } catch (error) {
            console.error('Failed to update budget:', error)
            showError('Error', 'Failed to update budget')
        }
    }

    const deleteBudget = async (id: string) => {
        try {
            await deleteBudgetDb(id)
            setBudgets(prev => prev.filter(b => b.id !== id))
            showSuccess('Budget Deleted', 'Budget removed successfully')
        } catch (error) {
            console.error('Failed to delete budget:', error)
            showError('Error', 'Failed to delete budget')
        }
    }

    const addCategory = async (category: Category) => {
        try {
            await saveCategory(category)
            setCategories(prev => [...prev, category])
            showSuccess('Category Added', `${category.name} added`)
        } catch (error) {
            console.error('Failed to add category:', error)
            showError('Error', 'Failed to save category')
        }
    }

    const editCategory = async (id: string, updates: Partial<Category>) => {
        try {
            await updateCategoryDb(id, updates)
            setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c))
            showSuccess('Category Updated', 'Category updated successfully')
        } catch (error) {
            console.error('Failed to update category:', error)
            showError('Error', 'Failed to update category')
        }
    }

    const undo = async () => {
        const action = historyManager.undo()
        if (!action) {
            showInfo('Nothing to Undo')
            return
        }

        try {
            if (action.type === 'ADD_EXPENSE') {
                await deleteExpenseDb(action.data.id)
                setExpenses(prev => prev.filter(e => e.id !== action.data.id))
                showSuccess('Undone', 'Expense addition undone')
            } else if (action.type === 'DELETE_EXPENSE') {
                await saveExpense(action.data)
                setExpenses(prev => [action.data, ...prev])
                showSuccess('Undone', 'Expense restored')
            } else if (action.type === 'EDIT_EXPENSE') {
                await updateExpenseDb(action.data.id, action.previousState)
                setExpenses(prev => prev.map(e => e.id === action.data.id ? action.previousState : e))
                showSuccess('Undone', 'Changes reverted')
            }
            setHistoryVersion(v => v + 1)
        } catch (error) {
            console.error('Undo failed:', error)
            showError('Undo Failed')
        }
    }

    const redo = async () => {
        const action = historyManager.redo()
        if (!action) {
            showInfo('Nothing to Redo')
            return
        }

        try {
            if (action.type === 'ADD_EXPENSE') {
                await saveExpense(action.data)
                setExpenses(prev => [action.data, ...prev])
                showSuccess('Redone', 'Expense re-added')
            } else if (action.type === 'DELETE_EXPENSE') {
                await deleteExpenseDb(action.data.id)
                setExpenses(prev => prev.filter(e => e.id !== action.data.id))
                showSuccess('Redone', 'Expense deleted again')
            } else if (action.type === 'EDIT_EXPENSE') {
                await updateExpenseDb(action.data.id, action.data.updates)
                setExpenses(prev => prev.map(e => e.id === action.data.id ? { ...e, ...action.data.updates } : e))
                showSuccess('Redone', 'Changes reapplied')
            }
            setHistoryVersion(v => v + 1)
        } catch (error) {
            console.error('Redo failed:', error)
            showError('Redo Failed')
        }
    }

    const deleteCategory = async (id: string) => {
        try {
            await deleteCategoryDb(id)
            setCategories(prev => prev.filter(c => c.id !== id))
            showSuccess('Category Deleted', 'Category removed successfully')
        } catch (error) {
            console.error('Failed to delete category:', error)
            showError('Error', 'Failed to delete category')
        }
    }

    const importData = async (file: File) => {
        try {
            const text = await file.text()
            const data = JSON.parse(text)
            if (data.expenses && Array.isArray(data.expenses)) {
                importExpenses(data.expenses)
                refreshData()
                showSuccess('Import Successful', 'Data imported successfully')
            } else {
                throw new Error('Invalid file format')
            }
        } catch (error) {
            console.error('Import failed:', error)
            showError('Import Failed', 'Could not import data')
        }
    }

    return (
        <ExpenseContext.Provider value={{
            expenses,
            budgets,
            categories,
            loading,
            addExpense,
            editExpense,
            deleteExpense,
            addBudget,
            editBudget,
            deleteBudget,
            addCategory,
            editCategory,
            deleteCategory,
            importData,
            refreshData,
            undo,
            redo,
            canUndo: historyManager.canUndo(),
            canRedo: historyManager.canRedo()
        }}>
            {children}
        </ExpenseContext.Provider>
    )
}

export function useExpense() {
    const context = useContext(ExpenseContext)
    if (context === undefined) {
        throw new Error('useExpense must be used within an ExpenseProvider')
    }
    return context
}
