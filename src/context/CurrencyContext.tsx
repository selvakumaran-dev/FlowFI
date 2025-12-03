import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'JPY' | 'CAD' | 'AUD'

interface Currency {
    code: CurrencyCode
    symbol: string
    name: string
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
}

interface CurrencyContextType {
    currency: Currency
    setCurrency: (code: CurrencyCode) => void
    formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('USD')

    useEffect(() => {
        const saved = localStorage.getItem('flowfi_currency') as CurrencyCode
        if (saved && CURRENCIES[saved]) {
            setCurrencyCode(saved)
        }
    }, [])

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyCode(code)
        localStorage.setItem('flowfi_currency', code)
    }

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
        }).format(amount)
    }

    return (
        <CurrencyContext.Provider value={{
            currency: CURRENCIES[currencyCode],
            setCurrency,
            formatAmount
        }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider')
    }
    return context
}
