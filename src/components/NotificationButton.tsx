'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { requestNotificationPermission, showNotification } from '@/lib/notifications'

export default function NotificationButton() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isEnabled, setIsEnabled] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission)
      setIsEnabled(Notification.permission === 'granted')
    }
  }, [])

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission()
    if (granted) {
      setPermission('granted')
      setIsEnabled(true)
      showNotification('Notifications Enabled!', {
        body: 'You will receive daily reminders to track your expenses.',
      })
    } else {
      setPermission('denied')
      setIsEnabled(false)
    }
  }

  const handleTestNotification = () => {
    showNotification('Daily Expense Reminder', {
      body: "Don't forget to track your expenses today! Click to add an expense.",
    })
  }

  if (permission === 'denied') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Notifications are blocked. Please enable them in your browser settings.
        </p>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      {!isEnabled ? (
        <button
          onClick={handleEnableNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Bell className="w-5 h-5" />
          Enable Notifications
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-medium">Notifications Enabled</span>
          </div>
          <button
            onClick={handleTestNotification}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Test
          </button>
        </div>
      )}
    </div>
  )
}
