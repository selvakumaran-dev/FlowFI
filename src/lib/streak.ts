import type { Expense } from '@/types/expense'

export interface StreakData {
    currentStreak: number
    longestStreak: number
    lastLogDate: string | null
    totalDays: number
}

export const calculateStreak = (expenses: Expense[]): StreakData => {
    if (expenses.length === 0) {
        return {
            currentStreak: 0,
            longestStreak: 0,
            lastLogDate: null,
            totalDays: 0,
        }
    }

    const sortedExpenses = [...expenses].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    )

    const uniqueDates = [...new Set(sortedExpenses.map(e => e.date))].sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = 0; i < uniqueDates.length; i++) {
        const expectedDate = new Date()
        expectedDate.setDate(expectedDate.getDate() - i)
        const expectedDateStr = expectedDate.toISOString().split('T')[0]

        if (uniqueDates[i] === expectedDateStr) {
            currentStreak++
            tempStreak++
        } else {
            break
        }
    }

    tempStreak = 1
    for (let i = 0; i < uniqueDates.length - 1; i++) {
        const current = new Date(uniqueDates[i])
        const next = new Date(uniqueDates[i + 1])
        const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))

        if (diffDays === 1) {
            tempStreak++
            longestStreak = Math.max(longestStreak, tempStreak)
        } else {
            tempStreak = 1
        }
    }

    longestStreak = Math.max(longestStreak, currentStreak, tempStreak)

    return {
        currentStreak,
        longestStreak,
        lastLogDate: uniqueDates[0] || null,
        totalDays: uniqueDates.length,
    }
}

export const getStreakMessage = (streak: number): string => {
    if (streak === 0) return "Start your journey today! 🌱"
    if (streak === 1) return "Great start! Keep going! 🎯"
    if (streak < 7) return `${streak} days strong! 💪`
    if (streak < 30) return `Amazing ${streak}-day streak! 🔥`
    if (streak < 100) return `Incredible ${streak} days! You're a champion! 🏆`
    return `Legendary ${streak}-day streak! 🌟`
}

export const shouldShowOneDayReminder = (expenses: Expense[]): boolean => {
    const today = new Date().toISOString().split('T')[0]
    return !expenses.some(e => e.date === today)
}
