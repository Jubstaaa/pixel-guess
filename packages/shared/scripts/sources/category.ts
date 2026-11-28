export interface CategoryMeta {
    exportName: string
    iconUrl: string
    imageType: 'character' | 'logo' | 'poster'
    name: string
    slug: string
}

export interface CategoryResult {
    characters: CharacterEntry[]
    meta: CategoryMeta
}

export interface CharacterEntry {
    name: string
    remoteUrl: string
}

export function byName(a: CharacterEntry, b: CharacterEntry): number {
    return a.name.localeCompare(b.name)
}
