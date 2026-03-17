import type { Character } from '@pixel-guess/shared'

export interface CharacterSearchProps {
    characters: Character[]
    excludeIndices: number[]
    onSelect: (character: Character, index: number) => void
}
