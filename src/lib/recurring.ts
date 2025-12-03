import type { Expense } from '@/types/expense'
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, format, parseISO } from 'date-fns'

export const generateRecurringExpenses = (expenses: Expense[]): Expense[] => {
    const recurringTemplates = expenses.filter(e => e.isRecurring && !e.parentRecurringId)
    const generatedExpenses: Expense[] = []
    const now = new Date()

    recurringTemplates.forEach(template => {
        if (!template.recurringFrequency) return

        const startDate = parseISO(template.date)
        const endDate = template.recurringEndDate ? parseISO(template.recurringEndDate) : now

        // Don't generate if end date has passed
        if (template.recurringEndDate && isBefore(endDate, now)) {
            return
        }

        let currentDate = getNextRecurringDate(template, startDate)

        // Generate all missing recurring expenses up to now
        while (isBefore(currentDate, now) && !isAfter(currentDate, endDate)) {
            const dateStr = format(currentDate, 'yyyy-MM-dd')

            // Check if this recurring expense already exists
            const exists = expenses.some(
                e => e.parentRecurringId === template.id && e.date === dateStr
            )

            if (!exists) {
                generatedExpenses.push({
                    ...template,
                    id: `${template.id}-${dateStr}`,
                    date: dateStr,
                    createdAt: Date.now(),
                    parentRecurringId: template.id,
                    isRecurring: false, // Generated instances are not recurring themselves
                })
            }

            currentDate = getNextRecurringDate(template, currentDate)
        }
    })

    return generatedExpenses
}

/**
 * Get the next date for a recurring expense
 */
export const getNextRecurringDate = (expense: Expense, fromDate: Date = new Date()): Date => {
    if (!expense.recurringFrequency) return fromDate

    switch (expense.recurringFrequency) {
        case 'daily':
            return addDays(fromDate, 1)
        case 'weekly':
            return addWeeks(fromDate, 1)
        case 'monthly':
            return addMonths(fromDate, 1)
        case 'yearly':
            return addYears(fromDate, 1)
        default:
            return fromDate
    }
}

/**
 * Check if a recurring expense should generate new instances
 */
export const shouldGenerateRecurring = (expense: Expense): boolean => {
    if (!expense.isRecurring || !expense.recurringFrequency) return false

    const now = new Date()

    // Check if end date has passed
    if (expense.recurringEndDate) {
        const endDate = parseISO(expense.recurringEndDate)
        if (isBefore(endDate, now)) return false
    }

    return true
}

/**
 * Get a human-readable description of the recurring pattern
 */
export const getRecurringDescription = (expense: Expense): string => {
    if (!expense.isRecurring || !expense.recurringFrequency) return ''

    const frequency = expense.recurringFrequency
    const endDate = expense.recurringEndDate
        ? ` until ${format(parseISO(expense.recurringEndDate), 'MMM dd, yyyy')}`
        : ''

    return `Repeats ${frequency}${endDate}`
}
