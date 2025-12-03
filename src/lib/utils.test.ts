import { describe, it, expect } from 'vitest'
import { formatCurrency, calculateStats } from './utils'
import type { Expense, Budget } from '@/types/expense'

describe('Utils', () => {
    describe('formatCurrency', () => {
        it('formats number to INR currency string', () => {
            expect(formatCurrency(1000)).toBe('₹1,000')
            expect(formatCurrency(1000.50)).toBe('₹1,000.5')
            expect(formatCurrency(0)).toBe('₹0')
        })
    })

    describe('calculateStats', () => {
        const mockExpenses: Expense[] = [
            {
                id: '1',
                amount: 500,
                date: new Date().toISOString().split('T')[0], // Today
                category: 'Food',
                description: 'Lunch',
                createdAt: Date.now(),
                classification: 'ESSENTIAL'
            },
            {
                id: '2',
                amount: 1000,
                date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                category: 'Transport',
                description: 'Taxi',
                createdAt: Date.now(),
                classification: 'ESSENTIAL'
            }
        ]

        const mockBudgets: Budget[] = []

        it('calculates total expenses correctly', () => {
            const stats = calculateStats(mockExpenses, mockBudgets)
            expect(stats.total).toBe(1500)
        })

        it('calculates category breakdown correctly', () => {
            const stats = calculateStats(mockExpenses, mockBudgets)
            expect(stats.byCategory).toEqual({
                Food: 500,
                Transport: 1000
            })
        })
    })
})
