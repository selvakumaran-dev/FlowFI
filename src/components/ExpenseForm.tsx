import type { Expense } from '@/types/expense'
import { useState, useRef } from 'react'
import { X, Repeat, Sparkles, Heart, Trash2, Calendar, Camera } from 'lucide-react'
import TagInput from './TagInput'
import AwarenessBanner from './AwarenessBanner'
import { saveReceipt } from '@/lib/db'

import { useExpense } from '@/context/ExpenseContext'

interface ExpenseFormProps {
  onClose: () => void
}

export default function ExpenseForm({ onClose }: ExpenseFormProps) {
  const { addExpense, categories, expenses } = useExpense()

  // Derive all tags from expenses
  const allTags = Array.from(new Set(expenses.flatMap(e => e.tags || [])))

  const [amount, setAmount] = useState('')
  // ... rest of state
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(categories[0]?.name || 'Other')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly')
  const [recurringEndDate, setRecurringEndDate] = useState('')
  const [classification, setClassification] = useState<'ESSENTIAL' | 'JOY' | 'WASTE'>('ESSENTIAL')
  const [event, setEvent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description) {
      alert('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)

    try {
      const expenseId = Date.now().toString() + Math.random()
      let receiptId: string | undefined

      if (receiptFile) {
        receiptId = `receipt-${expenseId}`
        await saveReceipt(receiptId, receiptFile)
      }

      const expense: Expense = {
        id: expenseId,
        amount: parseFloat(amount),
        description,
        category,
        date,
        createdAt: Date.now(),
        notes: notes || undefined,
        tags: tags.length > 0 ? tags : undefined,
        isRecurring: isRecurring || undefined,
        recurringFrequency: isRecurring ? recurringFrequency : undefined,
        recurringEndDate: isRecurring && recurringEndDate ? recurringEndDate : undefined,
        classification,
        event: event || undefined,
        receiptId,
      }

      await addExpense(expense)

      // Reset form
      setAmount('')
      setDescription('')
      setCategory(categories[0]?.name || 'Other')
      setDate(new Date().toISOString().split('T')[0])
      setNotes('')
      setTags([])
      setIsRecurring(false)
      setRecurringEndDate('')
      setClassification('ESSENTIAL')
      setEvent('')
      setReceiptFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end md:items-center justify-center md:p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-t-3xl md:rounded-2xl shadow-2xl w-full md:max-w-lg max-h-[90vh] md:max-h-[85vh] overflow-y-auto mobile-hide-scrollbar animate-slide-up safe-area-inset-bottom">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">Add Expense</h2>
          <button
            onClick={onClose}
            className="tap-target text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-2 -mr-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amount ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="0.00"
              required
            />
            <AwarenessBanner amount={parseFloat(amount) || 0} />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              placeholder="What did you spend on?"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
              required
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all resize-none"
              placeholder="Add any additional details..."
              rows={2}
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Receipt (Optional)
            </label>
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="hidden"
                id="receipt-upload"
              />
              <label
                htmlFor="receipt-upload"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300"
              >
                <Camera className="w-4 h-4" />
                {receiptFile ? 'Change Receipt' : 'Add Receipt'}
              </label>
              {receiptFile && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                  <span className="truncate max-w-[150px]">{receiptFile.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tags */}
          <TagInput
            tags={tags}
            suggestions={allTags}
            onChange={setTags}
            placeholder="Add tags (e.g., work, personal, travel)..."
          />

          {/* Classification */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Spending Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setClassification('ESSENTIAL')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${classification === 'ESSENTIAL'
                  ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Sparkles className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Essential</span>
              </button>
              <button
                type="button"
                onClick={() => setClassification('JOY')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${classification === 'JOY'
                  ? 'bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-900/20 dark:border-pink-800 dark:text-pink-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Heart className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Joy</span>
              </button>
              <button
                type="button"
                onClick={() => setClassification('WASTE')}
                className={`flex flex-col items-center p-3 rounded-lg border transition-all ${classification === 'WASTE'
                  ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <Trash2 className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Waste</span>
              </button>
            </div>
          </div>

          {/* Event */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event / Festival (Optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                list="indian-events"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                placeholder="e.g., Diwali, Wedding, Trip..."
              />
              <datalist id="indian-events">
                <option value="Diwali" />
                <option value="Pongal" />
                <option value="Eid" />
                <option value="Wedding" />
                <option value="Temple Visit" />
                <option value="Raksha Bandhan" />
                <option value="Holi" />
                <option value="Navratri" />
                <option value="Christmas" />
                <option value="Birthday" />
              </datalist>
            </div>
          </div>

          {/* Recurring Expense */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <Repeat className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Make this a recurring expense
              </span>
            </label>

            {isRecurring && (
              <div className="mt-4 space-y-3 pl-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Frequency
                  </label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={recurringEndDate}
                    onChange={(e) => setRecurringEndDate(e.target.value)}
                    min={date}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty for indefinite recurrence
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
