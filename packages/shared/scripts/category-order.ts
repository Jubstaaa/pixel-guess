import type { CategoryResult } from './sources/category'

export const CATEGORY_ORDER = [
    'movies',
    'tv-shows',
    'anime-series',
    'pokemon',
    'harry-potter',
    'football',
    'brands',
    'flags',
    'people',
    'dragon-ball',
    'naruto',
    'one-piece',
    'attack-on-titan',
    'demon-slayer',
    'jujutsu-kaisen',
    'death-note',
    'my-hero-academia',
    'fullmetal-alchemist',
    'hunter-x-hunter',
    'league-of-legends',
    'valorant',
    'dota-2',
    'overwatch',
    'genshin-impact',
    'rick-and-morty',
]

export function orderCategories(results: CategoryResult[]): CategoryResult[] {
    const bySlug = new Map(results.map(r => [r.meta.slug, r]))
    const unordered = [...bySlug.keys()].filter(
        slug => !CATEGORY_ORDER.includes(slug)
    )
    const missing = CATEGORY_ORDER.filter(slug => !bySlug.has(slug))

    if (unordered.length > 0 || missing.length > 0) {
        throw new Error(
            `Category mismatch; not in CATEGORY_ORDER: ${unordered.join(', ') || 'none'}; missing from results: ${missing.join(', ') || 'none'}`
        )
    }

    return CATEGORY_ORDER.flatMap(slug => {
        const result = bySlug.get(slug)
        return result ? [result] : []
    })
}
