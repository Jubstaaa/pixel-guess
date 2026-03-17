export interface Category {
    slug: string
    name: string
    icon: string
    characterCount: number
}

export interface Character {
    name: string
    imageUrl: string
}

export interface GameState {
    currentCharacter: Character | null
    count: number
    seenIndices: number[]
}

export type Difficulty = 'easy' | 'hard'
