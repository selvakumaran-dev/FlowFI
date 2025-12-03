export interface NotificationItem {
    id: string
    type: NotificationType
    title: string
    message: string
    timestamp: number
    read: boolean
    icon?: string
    category?: string
    amount?: number
}

export type NotificationType =
    | 'DAILY_REMINDER'
    | 'BUDGET_WARNING'
    | 'BUDGET_EXCEEDED'
    | 'STREAK_MILESTONE'
    | 'WEEKLY_SUMMARY'
    | 'EXPENSE_ADDED'

export interface NotificationSettings {
    dailyReminders: {
        enabled: boolean
        times: string[]
        skipWeekends: boolean
    }
    budgetAlerts: {
        enabled: boolean
        threshold: number
        sound: boolean
        vibration: boolean
    }
    streakNotifications: {
        enabled: boolean
        milestones: number[]
    }
    weeklySummary: {
        enabled: boolean
        day: number
        time: string
    }
    general: {
        sound: boolean
        vibration: boolean
        autoDismiss: number
        showInCenter: boolean
    }
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    dailyReminders: {
        enabled: true,
        times: ['09:00', '18:00'],
        skipWeekends: false,
    },
    budgetAlerts: {
        enabled: true,
        threshold: 80,
        sound: true,
        vibration: true,
    },
    streakNotifications: {
        enabled: true,
        milestones: [7, 14, 30, 60, 90],
    },
    weeklySummary: {
        enabled: true,
        day: 0,
        time: '18:00',
    },
    general: {
        sound: true,
        vibration: true,
        autoDismiss: 5,
        showInCenter: true,
    },
}
