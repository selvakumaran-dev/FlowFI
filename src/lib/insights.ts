import type { Expense } from '@/types/expense'

export interface DailyReviewData {
    date: string
    overallSpending: 'good' | 'overspent'
    biggestCategory: string
    mood: 'happy' | 'neutral' | 'sad'
    totalSpent: number
    notes?: string
}

export const generateInsights = (expenses: Expense[]): string[] => {
    const insights: string[] = []

    const categoryTotals: Record<string, { total: number; count: number }> = {}
    expenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = { total: 0, count: 0 }
        }
        categoryTotals[expense.category].total += expense.amount
        categoryTotals[expense.category].count++
    })

    const smallExpenses = expenses.filter(e => e.amount < 100 && e.amount > 0)
    if (smallExpenses.length > 10) {
        const totalSmall = smallExpenses.reduce((sum, e) => sum + e.amount, 0)
        const yearlyImpact = totalSmall * 12
        insights.push(
            `You have ${smallExpenses.length} small expenses totaling ₹${totalSmall.toFixed(0)}. ` +
            `That's about ₹${yearlyImpact.toFixed(0)} per year! Consider tracking these more carefully.`
        )
    }

    Object.entries(categoryTotals).forEach(([category, data]) => {
        const avgPerTransaction = data.total / data.count

        if (category.toLowerCase().includes('food') && avgPerTransaction < 50) {
            const yearlyImpact = data.total * 365
            insights.push(
                `Your daily ${category} spending of ₹${data.total.toFixed(0)} becomes ` +
                `₹${yearlyImpact.toFixed(0)} per year. Small changes can save big!`
            )
        }

        if (data.count > 20) {
            insights.push(
                `You've logged ${data.count} ${category} expenses. ` +
                `Consider setting a budget of ₹${(data.total * 1.1).toFixed(0)} to stay on track.`
            )
        }
    })

    const wasteExpenses = expenses.filter(e => e.classification === 'WASTE')
    if (wasteExpenses.length > 0) {
        const totalWaste = wasteExpenses.reduce((sum, e) => sum + e.amount, 0)
        insights.push(
            `You've identified ₹${totalWaste.toFixed(0)} as wasteful spending. ` +
            `Great self-awareness! Redirecting this could save ₹${(totalWaste * 12).toFixed(0)} yearly.`
        )
    }

    const joyExpenses = expenses.filter(e => e.classification === 'JOY')
    if (joyExpenses.length > 0) {
        const totalJoy = joyExpenses.reduce((sum, e) => sum + e.amount, 0)
        insights.push(
            `You spent ₹${totalJoy.toFixed(0)} on things that brought you joy. ` +
            `That's wonderful! Balance is key to happy finances. 😊`
        )
    }

    return insights.slice(0, 3)
}

export const saveDailyReview = (review: DailyReviewData): void => {
    const reviews = getDailyReviews()
    const existingIndex = reviews.findIndex(r => r.date === review.date)

    if (existingIndex >= 0) {
        reviews[existingIndex] = review
    } else {
        reviews.push(review)
    }

    localStorage.setItem('daily_reviews', JSON.stringify(reviews))
}

export const getDailyReviews = (): DailyReviewData[] => {
    const stored = localStorage.getItem('daily_reviews')
    return stored ? JSON.parse(stored) : []
}

export const shouldShowDailyReview = (): boolean => {
    const today = new Date().toISOString().split('T')[0]
    const reviews = getDailyReviews()
    return !reviews.some(r => r.date === today)
}
