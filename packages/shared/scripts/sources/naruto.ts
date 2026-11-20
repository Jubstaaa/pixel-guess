import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const PAGE_SIZE = 100
const LIMIT = 60

const pageSchema = z.object({
    total: z.number().int().nonnegative(),
    characters: z.array(
        z.object({ name: z.string(), images: z.array(z.string()) })
    ),
})

function pageUrl(page: number): URL {
    const url = new URL('https://dattebayo-api.onrender.com/characters')
    url.searchParams.set('limit', String(PAGE_SIZE))
    if (page > 1) url.searchParams.set('page', String(page))
    return url
}

export async function fetchNaruto(): Promise<CategoryResult> {
    const first = await fetchJson(pageUrl(1), pageSchema)
    const totalPages = Math.ceil(first.total / PAGE_SIZE)
    const rest = await Promise.all(
        Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) =>
            fetchJson(pageUrl(i + 2), pageSchema)
        )
    )

    const characters = [first, ...rest]
        .flatMap((page) => page.characters)
        .flatMap(({ name, images: [image] }) =>
            image === undefined ? [] : [{ name, remoteUrl: image }]
        )
        .slice(0, LIMIT)
        .sort(byName)

    console.log(`Naruto: ${characters.length} characters`)
    return {
        meta: {
            slug: 'naruto',
            name: 'Naruto',
            exportName: 'narutoCharacters',
            imageType: 'poster',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Naruto_logo.svg/400px-Naruto_logo.svg.png',
        },
        characters,
    }
}
