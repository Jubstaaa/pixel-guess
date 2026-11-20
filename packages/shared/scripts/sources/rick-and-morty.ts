import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const MIN_EPISODES = 3

const pageSchema = z.object({
    info: z.object({ pages: z.number().int().positive() }),
    results: z.array(
        z.object({
            name: z.string(),
            image: z.string(),
            episode: z.array(z.string()),
        })
    ),
})

function pageUrl(page: number): URL {
    const url = new URL('https://rickandmortyapi.com/api/character')
    if (page > 1) url.searchParams.set('page', String(page))
    return url
}

export async function fetchRickAndMorty(): Promise<CategoryResult> {
    const first = await fetchJson(pageUrl(1), pageSchema)
    const rest = await Promise.all(
        Array.from({ length: first.info.pages - 1 }, (_, i) =>
            fetchJson(pageUrl(i + 2), pageSchema)
        )
    )

    const characters = [first, ...rest]
        .flatMap((page) => page.results)
        .filter((c) => c.episode.length >= MIN_EPISODES)
        .map(({ name, image }) => ({ name, remoteUrl: image }))
        .sort(byName)

    console.log(`Rick & Morty: ${characters.length} characters`)
    return {
        meta: {
            slug: 'rick-and-morty',
            name: 'Rick & Morty',
            exportName: 'rickAndMortyCharacters',
            imageType: 'poster',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Rick_and_Morty.svg/400px-Rick_and_Morty.svg.png',
        },
        characters,
    }
}
