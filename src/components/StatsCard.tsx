'use client'

import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Calendar, DollarSign, BarChart3 } from 'lucide-react'

interface StatsCardProps {
  title: string
  amount: number
  icon: 'total' | 'today' | 'week' | 'month'
}

const icons = {
  total: DollarSign,
  today: Calendar,
  week: TrendingUp,
  month: BarChart3,
}

export default function StatsCard({ title, amount, icon: iconType }: StatsCardProps) {
  const Icon = icons[iconType]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 md:p-4 lg:p-6 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">{title}</p>
          <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white truncate">
            {formatCurrency(amount)}
          </p>
        </div>
        <div className="bg-primary-100 dark:bg-primary-900 p-2 md:p-3 rounded-lg ml-2 flex-shrink-0">
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary-600 dark:text-primary-400" />
        </div>
      </div>
    </div>
  )
}

