export interface Expense {
  id: string
  amount: number
  description: string
  category: string
  date: string
  createdAt: number
  isRecurring?: boolean
  recurringFrequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  recurringEndDate?: string
  tags?: string[]
  notes?: string
  parentRecurringId?: string
  classification?: 'ESSENTIAL' | 'JOY' | 'WASTE'
  event?: string
  receiptId?: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  isDefault: boolean
  createdAt: number
}

export interface ExpenseStats {
  total: number
  today: number
  thisWeek: number
  thisMonth: number
  lastMonth: number
  yearToDate: number
  averageDaily: number
  averageMonthly: number
  byCategory: Record<string, number>
  budgetStatus: Record<string, BudgetStatus>
}

export interface BudgetStatus {
  spent: number
  limit: number
  percentage: number
  isOverBudget: boolean
  remaining: number
}

export interface Budget {
  id: string
  category: string
  monthlyLimit: number
  alertThreshold: number
  isActive: boolean
  createdAt: number
}

export interface MonthlyComparison {
  current: number
  previous: number
  change: number
  changePercent: number
}

export interface CategoryInsight {
  category: string
  total: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  averagePerTransaction: number
  transactionCount: number
}

