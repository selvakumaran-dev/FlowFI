import { useState, useMemo } from 'react'
import { calculateStats } from '@/lib/utils'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
// import { useCurrency } from '@/context/CurrencyContext'
import { useExpense } from '@/context/ExpenseContext'
import ExpenseForm from '@/components/ExpenseForm'
import ExpenseList from '@/components/ExpenseList'
import ExpenseChart from '@/components/ExpenseChart'
import StatsCard from '@/components/StatsCard'
import NotificationButton from '@/components/NotificationButton'
import BudgetManager from '@/components/BudgetManager'
import DataManager from '@/components/DataManager'
import AdvancedAnalytics from '@/components/AdvancedAnalytics'
import SearchFilter, { type FilterState } from '@/components/SearchFilter'
import CategoryManager from '@/components/CategoryManager'
import RecurringManager from '@/components/RecurringManager'
import Toast, { useToast } from '@/components/Toast'
import VoiceEntry from '@/components/VoiceEntry'
import DailyReview from '@/components/DailyReview'
import KhataMode from '@/components/KhataMode'
import FloatingActionMenu from '@/components/FloatingActionMenu'
import { LayoutDashboard, Wallet, Settings, BarChart3, Undo2, Redo2, Repeat } from 'lucide-react'
import { parseISO } from 'date-fns'

type Tab = 'dashboard' | 'analytics' | 'budgets' | 'recurring' | 'settings'

export default function App() {
  const {
    expenses,
    budgets,
    categories,
    addExpense,
    undo,
    redo,
    canUndo,
    canRedo
  } = useExpense()

  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCategories: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    selectedTags: [],
    sortBy: 'date',
    sortOrder: 'desc',
  })
  const [khataMode] = useState(false)
  const [showDailyReview, setShowDailyReview] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [showVoiceEntry, setShowVoiceEntry] = useState(false)
  const { toasts, removeToast, showInfo } = useToast()
  // const { formatAmount } = useCurrency()

  // Keyboard Shortcuts
  useKeyboardShortcuts([
    {
      key: 'z',
      ctrlKey: true,
      action: () => undo(),
      description: 'Undo last action',
    },
    {
      key: 'y',
      ctrlKey: true,
      action: () => redo(),
      description: 'Redo last action',
    },
    {
      key: 'n',
      altKey: true,
      action: () => {
        showInfo('Shortcut Used', 'Alt+N pressed')
        const addButton = document.querySelector('button[aria-label="Add Expense"]') as HTMLButtonElement
        if (addButton) addButton.click()
      },
      description: 'Add new expense',
    },
  ])

  // Filter expenses based on search/filter state
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(e =>
        e.description.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        e.notes?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(e => filters.selectedCategories.includes(e.category))
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(e => e.date >= filters.dateFrom)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(e => e.date <= filters.dateTo)
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter(e => e.amount >= parseFloat(filters.amountMin))
    }
    if (filters.amountMax) {
      filtered = filtered.filter(e => e.amount <= parseFloat(filters.amountMax))
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0
      if (filters.sortBy === 'date') {
        comparison = parseISO(a.date).getTime() - parseISO(b.date).getTime()
      } else if (filters.sortBy === 'amount') {
        comparison = a.amount - b.amount
      } else if (filters.sortBy === 'category') {
        comparison = a.category.localeCompare(b.category)
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [expenses, filters])

  const stats = calculateStats(expenses, budgets)

  const tabs = [
    { id: 'dashboard' as Tab, name: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics' as Tab, name: 'Analytics', icon: BarChart3 },
    { id: 'budgets' as Tab, name: 'Budgets', icon: Wallet },
    { id: 'recurring' as Tab, name: 'Recurring', icon: Repeat },
    { id: 'settings' as Tab, name: 'Settings', icon: Settings },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-8">
      <div className="container-responsive max-w-7xl">
        {/* Header */}
        <div className="mb-4 md:mb-8 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg z-10 -mx-4 px-4 md:mx-0 md:px-0 md:bg-transparent md:backdrop-blur-none md:static">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-4 py-3 md:py-0 md:mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-1">
                💰 FlowFi
              </h1>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                Every Rupee, In Control
              </p>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {/* Undo/Redo Buttons */}
              <button
                onClick={() => undo()}
                disabled={!canUndo}
                className="tap-target p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => redo()}
                disabled={!canRedo}
                className="tap-target p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-5 h-5" />
              </button>
              <NotificationButton />
            </div>
          </div>

          {/* Desktop Tab Navigation */}
          <div className="hidden md:flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden lg:inline">{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50">
          <div className="flex justify-around items-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 py-2 px-3 tap-target flex-1 transition-colors ${activeTab === tab.id
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-600 dark:text-gray-400'
                    }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs font-medium">{tab.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 md:space-y-6 lg:space-y-8 animate-fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <StatsCard title="Total Expenses" amount={stats.total} icon="total" />
              <StatsCard title="Today" amount={stats.today} icon="today" />
              <StatsCard title="This Week" amount={stats.thisWeek} icon="week" />
              <StatsCard title="This Month" amount={stats.thisMonth} icon="month" />
            </div>

            {/* Search & Filter */}
            <SearchFilter categories={categories} onFilterChange={setFilters} />

            {/* Charts */}
            <ExpenseChart expenses={filteredExpenses} />

            {/* Expense List */}
            <ExpenseList />
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AdvancedAnalytics
              expenses={expenses}
              mom={{
                current: stats.thisMonth,
                previous: stats.lastMonth,
                change: stats.thisMonth - stats.lastMonth,
                changePercent: stats.lastMonth > 0 ? ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100 : 0
              }}
            />
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="animate-fade-in">
            <BudgetManager />
          </div>
        )}

        {/* Recurring Tab */}
        {activeTab === 'recurring' && (
          <div className="animate-fade-in">
            <RecurringManager />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in space-y-6">
            {/* Category Manager */}
            <CategoryManager />

            {/* Data Manager */}
            <DataManager />
          </div>
        )}
      </div>

      {/* Floating Action Menu */}
      {!khataMode && (
        <>
          <FloatingActionMenu
            onAddExpense={() => setShowExpenseForm(true)}
            onVoiceEntry={() => setShowVoiceEntry(true)}
          />
          {showExpenseForm && (
            <ExpenseForm
              onClose={() => setShowExpenseForm(false)}
            />
          )}
          {showVoiceEntry && (
            <VoiceEntry
              onAdd={(expense) => {
                addExpense(expense)
                setShowVoiceEntry(false)
              }}
            />
          )}
        </>
      )}

      {/* Daily Review Modal */}
      {showDailyReview && (
        <DailyReview
          expenses={expenses}
          onClose={() => setShowDailyReview(false)}
        />
      )}

      {/* Khata Mode */}
      {khataMode && (
        <KhataMode
          onAdd={addExpense}
          expenses={expenses}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </main>
  )
}
