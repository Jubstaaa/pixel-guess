import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Search } from 'lucide-react'

import { filterCharacters, getImageUrl } from '@pixel-guess/shared'
import type { Character } from '@pixel-guess/shared'

interface CharacterSearchProps {
    characters: Character[]
    disabled?: boolean
    excludeIndices: number[]
    onSelect: (character: Character, index: number) => void
}

export const CharacterSearch = ({
    characters,
    disabled = false,
    excludeIndices,
    onSelect,
}: CharacterSearchProps) => {
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)
    const id = useId()
    const inputId = `${id}-input`
    const listboxId = `${id}-listbox`
    const optionId = (i: number) => `${id}-option-${i}`

    const filteredCharacters = filterCharacters(
        characters,
        input,
        excludeIndices
    )
    const isExpanded = isOpen && !disabled && filteredCharacters.length > 0

    useEffect(() => {
        setSelectedIndex(0)
    }, [input])

    const handleSelect = useCallback(
        (index: number) => {
            const item = filteredCharacters[index]
            if (!item) return
            onSelect(item.character, item.index)
            setInput('')
            setIsOpen(false)
        },
        [filteredCharacters, onSelect]
    )

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (!isExpanded) return
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex((prev) =>
                        Math.min(prev + 1, filteredCharacters.length - 1)
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex((prev) => Math.max(prev - 1, 0))
                    break
                case 'Enter':
                    e.preventDefault()
                    handleSelect(selectedIndex)
                    break
                case 'Escape':
                    setIsOpen(false)
                    break
            }
        },
        [isExpanded, filteredCharacters.length, selectedIndex, handleSelect]
    )

    useEffect(() => {
        const onClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', onClickOutside)
        return () => document.removeEventListener('mousedown', onClickOutside)
    }, [])

    return (
        <div ref={containerRef} className="relative w-full">
            <label className="sr-only" htmlFor={inputId}>
                Guess the character
            </label>
            <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
                    <Search aria-hidden="true" className="h-5 w-5" />
                </div>
                <input
                    aria-activedescendant={
                        isExpanded ? optionId(selectedIndex) : undefined
                    }
                    aria-autocomplete="list"
                    aria-controls={listboxId}
                    aria-expanded={isExpanded}
                    autoComplete="off"
                    className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-4 text-[16px] text-foreground placeholder-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none disabled:opacity-50"
                    disabled={disabled}
                    id={inputId}
                    placeholder="Search character..."
                    role="combobox"
                    type="text"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value)
                        setIsOpen(true)
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            {isExpanded && (
                <ul
                    aria-labelledby={inputId}
                    className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface/95 p-1.5 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]"
                    id={listboxId}
                    role="listbox"
                >
                    {filteredCharacters.map(({ character, index }, i) => (
                        <li
                            key={index}
                            aria-selected={i === selectedIndex}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                                i === selectedIndex
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-foreground hover:bg-surface-hover'
                            }`}
                            id={optionId(i)}
                            role="option"
                            onMouseEnter={() => setSelectedIndex(i)}
                            // Keep focus in the input so the list stays a
                            // combobox popup rather than a focus trap.
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelect(i)}
                        >
                            <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background">
                                <img
                                    alt=""
                                    className="h-full w-full object-cover"
                                    height={40}
                                    loading="lazy"
                                    src={getImageUrl(character.imageUrl)}
                                    width={40}
                                />
                            </div>
                            <span className="flex-1 truncate text-left text-[15px] font-medium">
                                {character.name}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
