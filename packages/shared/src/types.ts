export interface Category {
    characterCount: number
    icon: string
    imageType: ImageType
    name: string
    slug: string
}

export interface Character {
    imageUrl: string
    name: string
}

export type Difficulty = 'easy' | 'hard'

export interface GameState {
    count: number
    currentCharacter: Character | null
    seenIndices: number[]
}

export type ImageType = 'character' | 'logo' | 'poster'
