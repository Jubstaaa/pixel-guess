export type ImageType = 'character' | 'poster' | 'logo'

export interface Category {
    slug: string
    name: string
    icon: string
    characterCount: number
    imageType: ImageType
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
