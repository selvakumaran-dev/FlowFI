export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const showNotification = (title: string, options?: NotificationOptions): void => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      ...options,
    })
  }
}

export const scheduleDailyReminder = (callback: () => void): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  // Check if it's a new day and show notification
  const checkAndNotify = () => {
    const lastNotificationDate = localStorage.getItem('last_notification_date')
    const today = new Date().toDateString()

    if (lastNotificationDate !== today) {
      callback()
      localStorage.setItem('last_notification_date', today)
    }
  }

  // Check immediately
  checkAndNotify()

  // Check every hour
  const interval = setInterval(checkAndNotify, 60 * 60 * 1000)

  // Return cleanup function
  return () => clearInterval(interval)
}

