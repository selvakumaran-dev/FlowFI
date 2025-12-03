import type { Expense, MonthlyComparison } from '@/types/expense'
import { calculateYearOverYear, getCategoryInsights } from '@/lib/utils'
import {
    exponentialSmoothing,
    linearRegression,
    calculateVolatility,
    detectAnomalies,
    detectSeasonalPatterns
} from '@/lib/advanced-analytics'
import { TrendingUp, TrendingDown, Minus, Target, Lightbulb, AlertTriangle, Activity, BarChart3 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    Bar,
    Line,
    Area,
    ComposedChart
} from 'recharts'

interface AdvancedAnalyticsProps {
    expenses: Expense[]
    mom: MonthlyComparison
}

export default function AdvancedAnalytics({ expenses, mom }: AdvancedAnalyticsProps) {
    const yoy = calculateYearOverYear(expenses)
    const prediction = exponentialSmoothing(expenses)
    const trendAnalysis = linearRegression(expenses)
    const volatility = calculateVolatility(expenses)
    const anomalies = detectAnomalies(expenses)
    const seasonalPatterns = detectSeasonalPatterns(expenses)
    const insights = getCategoryInsights(expenses)

    const getTrendIcon = (change: number) => {
        if (change > 5) return <TrendingUp className="w-5 h-5 text-red-500" />
        if (change < -5) return <TrendingDown className="w-5 h-5 text-green-500" />
        return <Minus className="w-5 h-5 text-gray-500" />
    }

    const getTrendColor = (change: number) => {
        if (change > 5) return 'text-red-600 dark:text-red-400'
        if (change < -5) return 'text-green-600 dark:text-green-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    const getVolatilityColor = (level: string) => {
        if (level === 'low') return 'text-green-600 dark:text-green-400'
        if (level === 'medium') return 'text-yellow-600 dark:text-yellow-400'
        return 'text-red-600 dark:text-red-400'
    }

    // Prepare data for comparison chart with confidence intervals
    const comparisonData = [
        {
            name: 'Last Month',
            amount: mom.previous,
            lower: mom.previous,
            upper: mom.previous,
        },
        {
            name: 'This Month',
            amount: mom.current,
            lower: mom.current,
            upper: mom.current,
        },
        {
            name: 'Predicted Next',
            amount: prediction.value,
            lower: prediction.confidenceInterval.lower,
            upper: prediction.confidenceInterval.upper,
        },
    ]

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="space-y-6">
            {/* Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Month over Month */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                        Month-over-Month
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Month</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {formatCurrency(mom.previous)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">This Month</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {formatCurrency(mom.current)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change</span>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(mom.changePercent)}
                                    <span className={`font-bold ${getTrendColor(mom.changePercent)}`}>
                                        {mom.changePercent > 0 ? '+' : ''}
                                        {mom.changePercent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatCurrency(Math.abs(mom.change))} {mom.change > 0 ? 'more' : 'less'} than last month
                            </p>
                        </div>
                    </div>
                </div>

                {/* Year over Year */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                        Year-over-Year
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Last Year (YTD)</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {formatCurrency(yoy.previous)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">This Year (YTD)</span>
                            <span className="font-semibold text-gray-800 dark:text-white">
                                {formatCurrency(yoy.current)}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Change</span>
                                <div className="flex items-center gap-2">
                                    {getTrendIcon(yoy.changePercent)}
                                    <span className={`font-bold ${getTrendColor(yoy.changePercent)}`}>
                                        {yoy.changePercent > 0 ? '+' : ''}
                                        {yoy.changePercent.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {formatCurrency(Math.abs(yoy.change))} {yoy.change > 0 ? 'more' : 'less'} than last year
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Prediction Card with Confidence Interval */}
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border border-primary-200 dark:border-primary-800">
                <div className="flex items-start gap-3">
                    <Target className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                AI-Powered Spending Prediction
                            </h3>
                            <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-full">
                                {prediction.method === 'exponential-smoothing' ? 'Exponential Smoothing' : prediction.method}
                            </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                            Triple exponential smoothing with {(prediction.accuracy * 100).toFixed(0)}% accuracy
                        </p>
                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                            {formatCurrency(prediction.value)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <span>Confidence Interval:</span>
                            <span className="font-medium">
                                {formatCurrency(prediction.confidenceInterval.lower)} - {formatCurrency(prediction.confidenceInterval.upper)}
                            </span>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Trend:</span>
                            {prediction.trend === 'increasing' && (
                                <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm font-medium">
                                    <TrendingUp className="w-4 h-4" />
                                    Increasing
                                </span>
                            )}
                            {prediction.trend === 'decreasing' && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm font-medium">
                                    <TrendingDown className="w-4 h-4" />
                                    Decreasing
                                </span>
                            )}
                            {prediction.trend === 'stable' && (
                                <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-sm font-medium">
                                    <Minus className="w-4 h-4" />
                                    Stable
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Volatility & Trend Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Volatility Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-purple-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Spending Volatility
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Consistency Score</span>
                            <span className="font-bold text-2xl text-gray-800 dark:text-white">
                                {volatility.consistencyScore.toFixed(0)}/100
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-primary-500 h-2 rounded-full transition-all"
                                style={{ width: `${volatility.consistencyScore}%` }}
                            />
                        </div>
                        <div className="pt-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Volatility Level</span>
                                <span className={`font-semibold capitalize ${getVolatilityColor(volatility.volatilityLevel)}`}>
                                    {volatility.volatilityLevel}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Std Deviation</span>
                                <span className="font-medium text-gray-800 dark:text-white">
                                    {formatCurrency(volatility.standardDeviation)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trend Analysis Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Trend Analysis
                        </h3>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">R² Correlation</span>
                            <span className="font-bold text-2xl text-gray-800 dark:text-white">
                                {(trendAnalysis.rSquared * 100).toFixed(0)}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all"
                                style={{ width: `${trendAnalysis.rSquared * 100}%` }}
                            />
                        </div>
                        <div className="pt-3 space-y-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Direction</span>
                                <span className={`font-semibold capitalize ${getTrendColor(trendAnalysis.slope)}`}>
                                    {trendAnalysis.direction}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Strength</span>
                                <span className="font-medium text-gray-800 dark:text-white capitalize">
                                    {trendAnalysis.strength}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Anomaly Alerts */}
            {anomalies.length > 0 && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl shadow-lg p-6 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                            Anomaly Detection
                        </h3>
                        <span className="ml-auto text-xs px-2 py-1 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 rounded-full">
                            {anomalies.length} unusual {anomalies.length === 1 ? 'expense' : 'expenses'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        {anomalies.slice(0, 3).map((anomaly, idx) => (
                            <div key={idx} className="p-3 bg-white dark:bg-gray-800 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-white">
                                            {anomaly.expense.description}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {anomaly.reason}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 dark:text-white">
                                            {formatCurrency(anomaly.expense.amount)}
                                        </p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${anomaly.severity === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                                            anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' :
                                                'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                                            }`}>
                                            {anomaly.severity}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Comparison Chart with Confidence Bands */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                    Spending Comparison with Confidence Intervals
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" />
                        <Tooltip
                            formatter={(value: number) => formatCurrency(value)}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                            }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="upper"
                            fill="#0ea5e9"
                            fillOpacity={0.1}
                            stroke="none"
                            name="Upper Bound"
                        />
                        <Area
                            type="monotone"
                            dataKey="lower"
                            fill="#ffffff"
                            fillOpacity={1}
                            stroke="none"
                            name="Lower Bound"
                        />
                        <Bar dataKey="amount" fill="#0ea5e9" name="Amount" radius={[8, 8, 0, 0]} />
                        <Line type="monotone" dataKey="amount" stroke="#1e40af" strokeWidth={2} name="Trend" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Seasonal Patterns */}
            {seasonalPatterns.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                        Seasonal Spending Patterns
                    </h3>
                    <div className="grid grid-cols-7 gap-2">
                        {seasonalPatterns.map((pattern) => (
                            <div key={pattern.dayOfWeek} className="text-center">
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                    {dayNames[pattern.dayOfWeek]}
                                </div>
                                <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                                    <div className="text-sm font-bold text-gray-800 dark:text-white">
                                        {formatCurrency(pattern.averageSpending)}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {pattern.frequency}x
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Category Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        Category Insights
                    </h3>
                </div>

                {insights.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                        No data available for insights
                    </p>
                ) : (
                    <div className="space-y-3">
                        {insights.slice(0, 5).map((insight) => (
                            <div
                                key={insight.category}
                                className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-800 dark:text-white">
                                            {insight.category}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {insight.transactionCount} transactions • Avg: {formatCurrency(insight.averagePerTransaction)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-800 dark:text-white">
                                            {formatCurrency(insight.total)}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {insight.percentage.toFixed(1)}% of total
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Trend:</span>
                                    {insight.trend === 'up' && (
                                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                            <TrendingUp className="w-4 h-4" />
                                            Increasing
                                        </span>
                                    )}
                                    {insight.trend === 'down' && (
                                        <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                            <TrendingDown className="w-4 h-4" />
                                            Decreasing
                                        </span>
                                    )}
                                    {insight.trend === 'stable' && (
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                            <Minus className="w-4 h-4" />
                                            Stable
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
