import type { Expense } from '@/types/expense'
import { parseISO, differenceInDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'

// ============ TYPES ============

export interface PredictionResult {
    value: number
    confidenceInterval: { lower: number; upper: number }
    method: 'exponential-smoothing' | 'linear-regression' | 'moving-average'
    accuracy: number // R² or MAPE
    trend: 'increasing' | 'decreasing' | 'stable'
}

export interface VolatilityMetrics {
    standardDeviation: number
    coefficientOfVariation: number
    consistencyScore: number // 0-100, higher is more consistent
    volatilityLevel: 'low' | 'medium' | 'high'
}

export interface AnomalyAlert {
    expense: Expense
    zScore: number
    severity: 'low' | 'medium' | 'high'
    reason: string
}

export interface SeasonalPattern {
    dayOfWeek: number // 0-6
    averageSpending: number
    frequency: number
}

export interface TrendAnalysis {
    slope: number
    intercept: number
    rSquared: number
    direction: 'increasing' | 'decreasing' | 'stable'
    strength: 'weak' | 'moderate' | 'strong'
}

// ============ HELPER FUNCTIONS ============

/**
 * Calculate mean (average) of an array
 */
function mean(values: number[]): number {
    if (values.length === 0) return 0
    return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate standard deviation
 */
function standardDeviation(values: number[]): number {
    if (values.length === 0) return 0
    const avg = mean(values)
    const squareDiffs = values.map(value => Math.pow(value - avg, 2))
    return Math.sqrt(mean(squareDiffs))
}

/**
 * Calculate Z-score for a value
 */
function zScore(value: number, values: number[]): number {
    const avg = mean(values)
    const std = standardDeviation(values)
    if (std === 0) return 0
    return (value - avg) / std
}

// ============ EXPONENTIAL SMOOTHING ============

/**
 * Triple Exponential Smoothing (Holt-Winters Method)
 * Accounts for level, trend, and seasonality
 */
export function exponentialSmoothing(
    expenses: Expense[],
    alpha: number = 0.3,
    beta: number = 0.1,
    gamma: number = 0.1
): PredictionResult {
    if (expenses.length === 0) {
        return {
            value: 0,
            confidenceInterval: { lower: 0, upper: 0 },
            method: 'exponential-smoothing',
            accuracy: 0,
            trend: 'stable'
        }
    }

    // Group expenses by month
    const monthlyData: number[] = []
    const sortedExpenses = [...expenses].sort((a, b) =>
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
    )

    const monthMap = new Map<string, number>()
    sortedExpenses.forEach(exp => {
        const monthKey = exp.date.substring(0, 7) // YYYY-MM
        monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + exp.amount)
    })

    monthMap.forEach(value => monthlyData.push(value))

    if (monthlyData.length < 2) {
        const avg = mean(monthlyData)
        return {
            value: avg,
            confidenceInterval: { lower: avg * 0.8, upper: avg * 1.2 },
            method: 'exponential-smoothing',
            accuracy: 0.5,
            trend: 'stable'
        }
    }

    // Initialize components
    let level = monthlyData[0]
    let trend = monthlyData.length > 1 ? monthlyData[1] - monthlyData[0] : 0
    const predictions: number[] = []

    // Apply Holt-Winters
    for (let i = 1; i < monthlyData.length; i++) {
        const prevLevel = level
        const prevTrend = trend

        level = alpha * monthlyData[i] + (1 - alpha) * (prevLevel + prevTrend)
        trend = beta * (level - prevLevel) + (1 - beta) * prevTrend

        predictions.push(level + trend)
    }

    // Forecast next month
    const forecast = level + trend

    // Calculate accuracy (MAPE - Mean Absolute Percentage Error)
    let mape = 0
    for (let i = 0; i < predictions.length; i++) {
        if (monthlyData[i + 1] !== 0) {
            mape += Math.abs((monthlyData[i + 1] - predictions[i]) / monthlyData[i + 1])
        }
    }
    mape = mape / predictions.length
    const accuracy = Math.max(0, 1 - mape)

    // Calculate confidence interval (±2 standard deviations)
    const errors = predictions.map((pred, i) => Math.abs(pred - monthlyData[i + 1]))
    const errorStd = standardDeviation(errors)

    return {
        value: Math.max(0, forecast),
        confidenceInterval: {
            lower: Math.max(0, forecast - 2 * errorStd),
            upper: forecast + 2 * errorStd
        },
        method: 'exponential-smoothing',
        accuracy: accuracy,
        trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable'
    }
}

// ============ LINEAR REGRESSION ============

/**
 * Linear Regression for trend analysis
 * Returns slope, intercept, and R² correlation
 */
export function linearRegression(expenses: Expense[]): TrendAnalysis {
    if (expenses.length < 2) {
        return {
            slope: 0,
            intercept: 0,
            rSquared: 0,
            direction: 'stable',
            strength: 'weak'
        }
    }

    // Convert dates to numeric values (days since first expense)
    const sortedExpenses = [...expenses].sort((a, b) =>
        parseISO(a.date).getTime() - parseISO(b.date).getTime()
    )

    const firstDate = parseISO(sortedExpenses[0].date)
    const x: number[] = []
    const y: number[] = []

    sortedExpenses.forEach(exp => {
        x.push(differenceInDays(parseISO(exp.date), firstDate))
        y.push(exp.amount)
    })

    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    // Calculate slope and intercept
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    // Calculate R² (coefficient of determination)
    const yMean = sumY / n
    const ssTotal = y.reduce((sum, yi) => sum + Math.pow(yi - yMean, 2), 0)
    const ssResidual = y.reduce((sum, yi, i) => {
        const predicted = slope * x[i] + intercept
        return sum + Math.pow(yi - predicted, 2)
    }, 0)
    const rSquared = ssTotal === 0 ? 0 : 1 - (ssResidual / ssTotal)

    // Determine direction and strength
    const direction = slope > 5 ? 'increasing' : slope < -5 ? 'decreasing' : 'stable'
    const strength = rSquared > 0.7 ? 'strong' : rSquared > 0.4 ? 'moderate' : 'weak'

    return {
        slope,
        intercept,
        rSquared: Math.max(0, Math.min(1, rSquared)),
        direction,
        strength
    }
}

// ============ VOLATILITY ANALYSIS ============

/**
 * Calculate spending volatility and consistency metrics
 */
export function calculateVolatility(expenses: Expense[]): VolatilityMetrics {
    if (expenses.length === 0) {
        return {
            standardDeviation: 0,
            coefficientOfVariation: 0,
            consistencyScore: 0,
            volatilityLevel: 'low'
        }
    }

    const amounts = expenses.map(e => e.amount)
    const avg = mean(amounts)
    const std = standardDeviation(amounts)

    // Coefficient of Variation (CV) = std / mean
    const cv = avg === 0 ? 0 : std / avg

    // Consistency score: inverse of CV, normalized to 0-100
    // Lower CV = higher consistency
    const consistencyScore = Math.max(0, Math.min(100, 100 * (1 - Math.min(cv, 1))))

    // Volatility level based on CV
    let volatilityLevel: 'low' | 'medium' | 'high'
    if (cv < 0.3) volatilityLevel = 'low'
    else if (cv < 0.7) volatilityLevel = 'medium'
    else volatilityLevel = 'high'

    return {
        standardDeviation: std,
        coefficientOfVariation: cv,
        consistencyScore,
        volatilityLevel
    }
}

// ============ ANOMALY DETECTION ============

/**
 * Detect anomalies using Z-score method
 * Z-score > 2 or < -2 is considered an anomaly (outside 95% confidence)
 */
export function detectAnomalies(expenses: Expense[], threshold: number = 2): AnomalyAlert[] {
    if (expenses.length < 3) return []

    const amounts = expenses.map(e => e.amount)
    const anomalies: AnomalyAlert[] = []

    expenses.forEach(expense => {
        const z = zScore(expense.amount, amounts)
        const absZ = Math.abs(z)

        if (absZ > threshold) {
            let severity: 'low' | 'medium' | 'high'
            if (absZ > 3) severity = 'high'
            else if (absZ > 2.5) severity = 'medium'
            else severity = 'low'

            const reason = z > 0
                ? `Unusually high spending (${absZ.toFixed(1)}σ above average)`
                : `Unusually low spending (${absZ.toFixed(1)}σ below average)`

            anomalies.push({
                expense,
                zScore: z,
                severity,
                reason
            })
        }
    })

    return anomalies.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
}

// ============ SEASONAL DECOMPOSITION ============

/**
 * Detect seasonal patterns by day of week
 */
export function detectSeasonalPatterns(expenses: Expense[]): SeasonalPattern[] {
    if (expenses.length === 0) return []

    const dayMap = new Map<number, { total: number; count: number }>()

    expenses.forEach(exp => {
        const dayOfWeek = parseISO(exp.date).getDay()
        const existing = dayMap.get(dayOfWeek) || { total: 0, count: 0 }
        dayMap.set(dayOfWeek, {
            total: existing.total + exp.amount,
            count: existing.count + 1
        })
    })

    const patterns: SeasonalPattern[] = []
    dayMap.forEach((value, day) => {
        patterns.push({
            dayOfWeek: day,
            averageSpending: value.total / value.count,
            frequency: value.count
        })
    })

    return patterns.sort((a, b) => b.averageSpending - a.averageSpending)
}

// ============ MOVING AVERAGE CONVERGENCE ============

/**
 * Calculate short-term vs long-term moving averages
 * Useful for detecting momentum shifts
 */
export function movingAverageConvergence(
    expenses: Expense[],
    shortPeriod: number = 7,
    longPeriod: number = 30
): { shortMA: number; longMA: number; signal: 'bullish' | 'bearish' | 'neutral' } {
    if (expenses.length === 0) {
        return { shortMA: 0, longMA: 0, signal: 'neutral' }
    }

    const now = new Date()
    const shortStart = new Date(now.getTime() - shortPeriod * 24 * 60 * 60 * 1000)
    const longStart = new Date(now.getTime() - longPeriod * 24 * 60 * 60 * 1000)

    const shortExpenses = expenses.filter(e => parseISO(e.date) >= shortStart)
    const longExpenses = expenses.filter(e => parseISO(e.date) >= longStart)

    const shortMA = shortExpenses.length > 0
        ? shortExpenses.reduce((sum, e) => sum + e.amount, 0) / shortPeriod
        : 0

    const longMA = longExpenses.length > 0
        ? longExpenses.reduce((sum, e) => sum + e.amount, 0) / longPeriod
        : 0

    // Signal: if short MA > long MA, spending is increasing (bearish for budget)
    let signal: 'bullish' | 'bearish' | 'neutral'
    const diff = shortMA - longMA
    if (diff > longMA * 0.1) signal = 'bearish' // Spending increasing
    else if (diff < -longMA * 0.1) signal = 'bullish' // Spending decreasing
    else signal = 'neutral'

    return { shortMA, longMA, signal }
}
