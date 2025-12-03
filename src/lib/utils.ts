import type { Expense, ExpenseStats, Budget, BudgetStatus, MonthlyComparison, CategoryInsight } from '@/types/expense'
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfMonth,
  subMonths,
  subYears,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isWithinInterval,
  parseISO,
  differenceInDays,
} from 'date-fns'

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export const calculateImpact = (dailyAmount: number): { monthly: number; yearly: number } => {
  return {
    monthly: dailyAmount * 30,
    yearly: dailyAmount * 365,
  }
}

export const calculateStats = (expenses: Expense[], budgets: Budget[] = []): ExpenseStats => {
  const now = new Date()
  const today = startOfDay(now)
  const weekStart = startOfWeek(now)
  const monthStart = startOfMonth(now)
  const yearStart = startOfYear(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const stats: ExpenseStats = {
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    lastMonth: 0,
    yearToDate: 0,
    averageDaily: 0,
    averageMonthly: 0,
    byCategory: {},
    budgetStatus: {},
  }

  // Calculate totals
  expenses.forEach((expense) => {
    const expenseDate = parseISO(expense.date)
    const amount = expense.amount

    stats.total += amount

    if (isSameDay(expenseDate, today)) {
      stats.today += amount
    }

    if (isSameWeek(expenseDate, weekStart)) {
      stats.thisWeek += amount
    }

    if (isSameMonth(expenseDate, monthStart)) {
      stats.thisMonth += amount
    }

    if (isWithinInterval(expenseDate, { start: lastMonthStart, end: lastMonthEnd })) {
      stats.lastMonth += amount
    }

    if (isWithinInterval(expenseDate, { start: yearStart, end: now })) {
      stats.yearToDate += amount
    }

    stats.byCategory[expense.category] = (stats.byCategory[expense.category] || 0) + amount
  })

  // Calculate averages
  if (expenses.length > 0) {
    const oldestExpense = expenses.reduce((oldest, exp) => {
      const expDate = parseISO(exp.date)
      const oldestDate = parseISO(oldest.date)
      return expDate < oldestDate ? exp : oldest
    })

    const daysSinceFirst = Math.max(1, differenceInDays(now, parseISO(oldestExpense.date)))
    stats.averageDaily = stats.total / daysSinceFirst
    stats.averageMonthly = (stats.total / daysSinceFirst) * 30
  }

  // Calculate budget status
  stats.budgetStatus = checkBudgetStatus(expenses, budgets)

  return stats
}

export const getExpensesByDateRange = (expenses: Expense[], days: number = 7): Expense[] => {
  const now = new Date()
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

  return expenses.filter((expense) => {
    const expenseDate = parseISO(expense.date)
    return expenseDate >= cutoffDate
  })
}

// ============ ADVANCED ANALYTICS ============

export const calculateMonthOverMonth = (expenses: Expense[]): MonthlyComparison => {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const current = expenses
    .filter(e => isWithinInterval(parseISO(e.date), { start: currentMonthStart, end: now }))
    .reduce((sum, e) => sum + e.amount, 0)

  const previous = expenses
    .filter(e => isWithinInterval(parseISO(e.date), { start: lastMonthStart, end: lastMonthEnd }))
    .reduce((sum, e) => sum + e.amount, 0)

  const change = current - previous
  const changePercent = previous > 0 ? (change / previous) * 100 : 0

  return { current, previous, change, changePercent }
}

export const calculateYearOverYear = (expenses: Expense[]): MonthlyComparison => {
  const now = new Date()
  const currentYearStart = startOfYear(now)
  const lastYearStart = startOfYear(subYears(now, 1))
  const lastYearEnd = endOfMonth(subYears(now, 1))

  const current = expenses
    .filter(e => isWithinInterval(parseISO(e.date), { start: currentYearStart, end: now }))
    .reduce((sum, e) => sum + e.amount, 0)

  const previous = expenses
    .filter(e => isWithinInterval(parseISO(e.date), { start: lastYearStart, end: lastYearEnd }))
    .reduce((sum, e) => sum + e.amount, 0)

  const change = current - previous
  const changePercent = previous > 0 ? (change / previous) * 100 : 0

  return { current, previous, change, changePercent }
}

export const predictNextMonthSpending = (expenses: Expense[]): number => {
  const now = new Date()
  const last3MonthsStart = startOfMonth(subMonths(now, 3))

  const recentExpenses = expenses.filter(e =>
    isWithinInterval(parseISO(e.date), { start: last3MonthsStart, end: now })
  )

  if (recentExpenses.length === 0) return 0

  const totalRecent = recentExpenses.reduce((sum, e) => sum + e.amount, 0)
  const monthsCount = 3

  return totalRecent / monthsCount
}

export const getCategoryInsights = (expenses: Expense[]): CategoryInsight[] => {
  const now = new Date()
  const currentMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))
  const lastMonthEnd = endOfMonth(subMonths(now, 1))

  const categoryTotals: Record<string, { current: number, previous: number, count: number }> = {}

  expenses.forEach(expense => {
    const expenseDate = parseISO(expense.date)
    const category = expense.category

    if (!categoryTotals[category]) {
      categoryTotals[category] = { current: 0, previous: 0, count: 0 }
    }

    if (isWithinInterval(expenseDate, { start: currentMonthStart, end: now })) {
      categoryTotals[category].current += expense.amount
      categoryTotals[category].count++
    }

    if (isWithinInterval(expenseDate, { start: lastMonthStart, end: lastMonthEnd })) {
      categoryTotals[category].previous += expense.amount
    }
  })

  const total = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.current, 0)

  return Object.entries(categoryTotals).map(([category, data]) => {
    const percentage = total > 0 ? (data.current / total) * 100 : 0
    const trend: 'up' | 'down' | 'stable' =
      data.current > data.previous * 1.1 ? 'up' :
        data.current < data.previous * 0.9 ? 'down' : 'stable'

    return {
      category,
      total: data.current,
      percentage,
      trend,
      averagePerTransaction: data.count > 0 ? data.current / data.count : 0,
      transactionCount: data.count,
    }
  }).sort((a, b) => b.total - a.total)
}

// ============ BUDGET FUNCTIONS ============

export const checkBudgetStatus = (expenses: Expense[], budgets: Budget[]): Record<string, BudgetStatus> => {
  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const status: Record<string, BudgetStatus> = {}

  budgets.forEach(budget => {
    if (!budget.isActive) return

    const spent = expenses
      .filter(e =>
        e.category.toLowerCase().trim() === budget.category.toLowerCase().trim() &&
        isWithinInterval(parseISO(e.date), { start: monthStart, end: monthEnd })
      )
      .reduce((sum, e) => sum + e.amount, 0)

    const percentage = (spent / budget.monthlyLimit) * 100
    const isOverBudget = spent > budget.monthlyLimit
    const remaining = Math.max(0, budget.monthlyLimit - spent)

    status[budget.category] = {
      spent,
      limit: budget.monthlyLimit,
      percentage,
      isOverBudget,
      remaining,
    }
  })

  return status
}

export const shouldShowBudgetAlert = (
  category: string,
  budgets: Budget[],
  expenses: Expense[]
): boolean => {
  const budget = budgets.find(b => b.category === category && b.isActive)
  if (!budget) return false

  const status = checkBudgetStatus(expenses, budgets)
  const categoryStatus = status[category]

  return categoryStatus && categoryStatus.percentage >= budget.alertThreshold
}

// ============ DATA EXPORT/IMPORT ============

export const exportToCSV = (expenses: Expense[]): string => {
  const headers = ['Date', 'Description', 'Category', 'Amount', 'Notes', 'Tags']
  const rows = expenses.map(e => [
    e.date,
    `"${e.description}"`,
    e.category,
    e.amount.toString(),
    `"${e.notes || ''}"`,
    `"${(e.tags || []).join(', ')}"`,
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csv
}

export const exportToJSON = (data: any): string => {
  return JSON.stringify(data, null, 2)
}

export const parseCSVImport = (csv: string): Expense[] => {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const expenses: Expense[] = []

  // Skip header row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const matches = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g)

    if (!matches || matches.length < 4) continue

    const [date, description, category, amount, notes, tags] = matches.map(m =>
      m.replace(/^"|"$/g, '').trim()
    )

    expenses.push({
      id: Date.now().toString() + Math.random(),
      date,
      description,
      category,
      amount: parseFloat(amount) || 0,
      notes: notes || undefined,
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      createdAt: Date.now(),
    })
  }

  return expenses
}

export const downloadFile = (content: string, filename: string, type: string = 'text/plain'): void => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ============ DATA VALIDATION ============

export interface ValidationError {
  row: number
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
}

export const validateExpense = (expense: Partial<Expense>, row: number = 0): ValidationError[] => {
  const errors: ValidationError[] = []

  // Validate amount
  if (expense.amount === undefined || expense.amount === null) {
    errors.push({ row, field: 'amount', message: 'Amount is required' })
  } else if (isNaN(expense.amount)) {
    errors.push({ row, field: 'amount', message: 'Amount must be a valid number' })
  } else if (expense.amount < 0) {
    errors.push({ row, field: 'amount', message: 'Amount cannot be negative' })
  } else if (expense.amount > 1000000) {
    errors.push({ row, field: 'amount', message: 'Amount seems unusually large' })
  }

  // Validate description
  if (!expense.description || expense.description.trim() === '') {
    errors.push({ row, field: 'description', message: 'Description is required' })
  } else if (expense.description.length > 200) {
    errors.push({ row, field: 'description', message: 'Description is too long (max 200 characters)' })
  }

  // Validate date
  if (!expense.date) {
    errors.push({ row, field: 'date', message: 'Date is required' })
  } else {
    try {
      const date = parseISO(expense.date)
      if (isNaN(date.getTime())) {
        errors.push({ row, field: 'date', message: 'Invalid date format (use YYYY-MM-DD)' })
      }
      // Check if date is too far in the future
      const futureLimit = new Date()
      futureLimit.setFullYear(futureLimit.getFullYear() + 1)
      if (date > futureLimit) {
        errors.push({ row, field: 'date', message: 'Date is too far in the future' })
      }
    } catch (error) {
      errors.push({ row, field: 'date', message: 'Invalid date format' })
    }
  }

  // Validate category
  if (!expense.category || expense.category.trim() === '') {
    errors.push({ row, field: 'category', message: 'Category is required' })
  }

  return errors
}

export const validateCSVData = (expenses: Expense[]): ValidationResult => {
  const errors: ValidationError[] = []
  const warnings: ValidationError[] = []

  expenses.forEach((expense, index) => {
    const expenseErrors = validateExpense(expense, index + 1)
    errors.push(...expenseErrors)
  })

  // Check for duplicates
  const duplicates = detectDuplicates(expenses)
  duplicates.forEach(({ indices, expense }) => {
    warnings.push({
      row: indices[0] + 1,
      field: 'duplicate',
      message: `Possible duplicate: ${expense.description} on ${expense.date} (${formatCurrency(expense.amount)})`,
    })
  })

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

export const detectDuplicates = (expenses: Expense[]): Array<{ indices: number[], expense: Expense }> => {
  const duplicates: Array<{ indices: number[], expense: Expense }> = []
  const seen = new Map<string, number[]>()

  expenses.forEach((expense, index) => {
    const key = `${expense.date}-${expense.amount}-${expense.description}`
    const existing = seen.get(key)
    if (existing) {
      existing.push(index)
    } else {
      seen.set(key, [index])
    }
  })

  seen.forEach((indices) => {
    if (indices.length > 1) {
      duplicates.push({ indices, expense: expenses[indices[0]] })
    }
  })

  return duplicates
}


