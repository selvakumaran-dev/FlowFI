import { useState, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import { Tag as TagIcon, X } from 'lucide-react'

interface TagInputProps {
    tags: string[]
    suggestions: string[]
    onChange: (tags: string[]) => void
    placeholder?: string
}

export default function TagInput({ tags, suggestions, onChange, placeholder = 'Add tags...' }: TagInputProps) {
    const [inputValue, setInputValue] = useState('')
    const [showSuggestions, setShowSuggestions] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const filteredSuggestions = suggestions.filter(
        s => !tags.includes(s) && s.toLowerCase().includes(inputValue.toLowerCase())
    )

    const addTag = (tag: string) => {
        const trimmed = tag.trim()
        if (trimmed && !tags.includes(trimmed)) {
            onChange([...tags, trimmed])
            setInputValue('')
            setShowSuggestions(false)
        }
    }

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter(t => t !== tagToRemove))
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault()
            addTag(inputValue)
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags[tags.length - 1])
        } else if (e.key === 'Escape') {
            setShowSuggestions(false)
        }
    }

    return (
        <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags (Optional)
            </label>

            <div className="flex flex-wrap gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-primary-500 dark:bg-gray-700">
                {tags.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded text-sm"
                    >
                        <TagIcon className="w-3 h-3" />
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-primary-900 dark:hover:text-primary-100"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </span>
                ))}

                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setShowSuggestions(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    placeholder={tags.length === 0 ? placeholder : ''}
                    className="flex-1 min-w-[120px] outline-none bg-transparent dark:text-white"
                />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredSuggestions.map((suggestion) => (
                        <button
                            key={suggestion}
                            type="button"
                            onClick={() => addTag(suggestion)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-800 dark:text-white"
                        >
                            <TagIcon className="w-4 h-4 text-gray-400" />
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Press Enter to add, Backspace to remove last tag
            </p>
        </div>
    )
}
