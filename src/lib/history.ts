import type { Expense } from '@/types/expense'

export interface Action {
    type: 'ADD_EXPENSE' | 'EDIT_EXPENSE' | 'DELETE_EXPENSE' | 'BULK_DELETE' | 'ADD_BUDGET' | 'DELETE_BUDGET' | 'CLEAR_ALL'
    timestamp: number
    data: any
    previousState?: any
}

class HistoryManager {
    private history: Action[] = []
    private currentIndex: number = -1
    private maxHistory: number = 20

    addAction(action: Action) {
        // Remove any actions after current index (when undoing then doing new action)
        this.history = this.history.slice(0, this.currentIndex + 1)

        // Add new action
        this.history.push(action)
        this.currentIndex++

        // Keep only last maxHistory actions
        if (this.history.length > this.maxHistory) {
            this.history.shift()
            this.currentIndex--
        }
    }

    canUndo(): boolean {
        return this.currentIndex >= 0
    }

    canRedo(): boolean {
        return this.currentIndex < this.history.length - 1
    }

    undo(): Action | null {
        if (!this.canUndo()) return null

        const action = this.history[this.currentIndex]
        this.currentIndex--
        return action
    }

    redo(): Action | null {
        if (!this.canRedo()) return null

        this.currentIndex++
        return this.history[this.currentIndex]
    }

    clear() {
        this.history = []
        this.currentIndex = -1
    }

    getHistory(): Action[] {
        return this.history.slice(0, this.currentIndex + 1)
    }
}

export const historyManager = new HistoryManager()

// Helper functions to create actions
export const createAddExpenseAction = (expense: Expense): Action => ({
    type: 'ADD_EXPENSE',
    timestamp: Date.now(),
    data: expense,
})

export const createEditExpenseAction = (id: string, updates: Partial<Expense>, previous: Expense): Action => ({
    type: 'EDIT_EXPENSE',
    timestamp: Date.now(),
    data: { id, updates },
    previousState: previous,
})

export const createDeleteExpenseAction = (expense: Expense): Action => ({
    type: 'DELETE_EXPENSE',
    timestamp: Date.now(),
    data: expense,
})

export const createBulkDeleteAction = (expenses: Expense[]): Action => ({
    type: 'BULK_DELETE',
    timestamp: Date.now(),
    data: expenses,
})
