import { useCallback, useEffect, useRef, useState } from 'react'

import { Search } from 'lucide-react'

import { filterCharacters } from '@pixel-guess/shared'

import { getImageUrl } from '@/lib/image-url'

import type { CharacterSearchProps } from './character-search.types'

export const CharacterSearch = ({
    characters,
    excludeIndices,
    onSelect,
}: CharacterSearchProps) => {
    const [input, setInput] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const filteredCharacters = filterCharacters(
        characters,
        input,
        excludeIndices
    )

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
            if (!isOpen || filteredCharacters.length === 0) return
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
        [isOpen, filteredCharacters.length, selectedIndex, handleSelect]
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
            <div className="relative group">
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-primary">
                    <Search className="h-5 w-5" />
                </div>
                <input
                    className="h-14 w-full rounded-2xl border border-border bg-surface pl-12 pr-4 text-[16px] text-foreground placeholder-muted focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Search character..."
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

            {isOpen && filteredCharacters.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border bg-surface/95 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)]">
                    <div className="p-1.5">
                        {filteredCharacters.map(({ character, index }, i) => (
                            <button
                                key={index}
                                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                                    i === selectedIndex
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground hover:bg-surface-hover'
                                }`}
                                type="button"
                                onMouseEnter={() => setSelectedIndex(i)}
                                onClick={() => handleSelect(i)}
                            >
                                <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-background">
                                    <img
                                        alt={character.name}
                                        className="h-full w-full object-cover"
                                        src={getImageUrl(character.imageUrl)}
                                    />
                                </div>
                                <span className="flex-1 truncate text-left text-[15px] font-medium">
                                    {character.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
