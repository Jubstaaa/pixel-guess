import type { categories } from '@pixel-guess/shared'
import type { Character, Difficulty } from '@pixel-guess/shared'

export interface GameContentProps {
    category: (typeof categories)[0]
    characters: Character[]
    difficulty: Difficulty
}
