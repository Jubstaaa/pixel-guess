export interface CharacterEntry {
    name: string
    remoteUrl: string
}

export interface CategoryMeta {
    slug: string
    name: string
    exportName: string
    imageType: 'character' | 'poster' | 'logo'
    iconUrl: string
}

export interface CategoryResult {
    meta: CategoryMeta
    characters: CharacterEntry[]
}

export function byName(a: CharacterEntry, b: CharacterEntry): number {
    return a.name.localeCompare(b.name)
}
