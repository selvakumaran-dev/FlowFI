import type { Expense } from '@/types/expense'
import { useState, useEffect } from 'react'
import { Mic, Loader2 } from 'lucide-react'

interface VoiceEntryProps {
    onAdd: (expense: Expense) => void
}

export default function VoiceEntry({ onAdd }: VoiceEntryProps) {
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(false)

    useEffect(() => {
        setIsSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
    }, [])

    const parseVoiceInput = (text: string): Partial<Expense> | null => {
        const lowerText = text.toLowerCase()

        const amountPatterns = [
            /(\d+)\s*(?:rupees|rupee|rs|inr|₹)/i,
            /(?:spent|paid)\s*(\d+)/i,
            /(\d+)\s*(?:on|for)/i,
        ]

        let amount = 0
        for (const pattern of amountPatterns) {
            const match = lowerText.match(pattern)
            if (match) {
                amount = parseInt(match[1])
                break
            }
        }

        if (amount === 0) return null

        const categoryMap: Record<string, string> = {
            'food': 'Food',
            'tea': 'Food',
            'coffee': 'Food',
            'lunch': 'Food',
            'dinner': 'Food',
            'breakfast': 'Food',
            'transport': 'Transport',
            'taxi': 'Transport',
            'auto': 'Transport',
            'bus': 'Transport',
            'metro': 'Transport',
            'shopping': 'Shopping',
            'clothes': 'Shopping',
            'groceries': 'Groceries',
            'vegetables': 'Groceries',
            'medicine': 'Healthcare',
            'doctor': 'Healthcare',
            'entertainment': 'Entertainment',
            'movie': 'Entertainment',
        }

        let category = 'Other'
        for (const [keyword, cat] of Object.entries(categoryMap)) {
            if (lowerText.includes(keyword)) {
                category = cat
                break
            }
        }

        const descPatterns = [
            /(?:on|for)\s+(.+?)(?:\s+(?:spent|paid|rupees|rs|₹|$))/i,
            /(?:spent|paid)\s+\d+\s+(?:on|for)\s+(.+)/i,
        ]

        let description = 'Voice entry'
        for (const pattern of descPatterns) {
            const match = text.match(pattern)
            if (match) {
                description = match[1].trim()
                break
            }
        }

        return {
            amount,
            category,
            description: description.charAt(0).toUpperCase() + description.slice(1),
            notes: `Voice: "${text}"`,
        }
    }

    const startListening = () => {
        if (!isSupported) {
            alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.')
            return
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
        const recognition = new SpeechRecognition()

        recognition.lang = 'en-IN'
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => {
            setIsListening(true)
            setTranscript('Listening...')
        }

        recognition.onresult = (event: any) => {
            const text = event.results[0][0].transcript
            setTranscript(text)

            const parsed = parseVoiceInput(text)
            if (parsed && parsed.amount) {
                const expense: Expense = {
                    id: Date.now().toString() + Math.random(),
                    amount: parsed.amount,
                    description: parsed.description || 'Voice entry',
                    category: parsed.category || 'Other',
                    date: new Date().toISOString().split('T')[0],
                    createdAt: Date.now(),
                    notes: parsed.notes,
                    classification: 'ESSENTIAL',
                }
                onAdd(expense)
                setTranscript(`Added: ${expense.description} - ₹${expense.amount}`)
                setTimeout(() => setTranscript(''), 3000)
            } else {
                setTranscript('Could not understand. Please try again.')
                setTimeout(() => setTranscript(''), 3000)
            }
        }

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error)
            setTranscript('Error: ' + event.error)
            setIsListening(false)
            setTimeout(() => setTranscript(''), 3000)
        }

        recognition.onend = () => {
            setIsListening(false)
        }

        recognition.start()
    }

    if (!isSupported) {
        return null
    }

    return (
        <div className="fixed bottom-36 right-4 md:bottom-28 md:right-8 z-40">
            <button
                onClick={startListening}
                disabled={isListening}
                className={`p-4 rounded-full shadow-lg transition-all duration-200 ${isListening
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-110'
                    } text-white`}
                aria-label="Voice entry"
            >
                {isListening ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                    <Mic className="w-6 h-6" />
                )}
            </button>

            {transcript && (
                <div className="absolute bottom-full right-0 mb-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-xs animate-slide-up">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{transcript}</p>
                </div>
            )}
        </div>
    )
}
