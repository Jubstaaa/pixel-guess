import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const heroesSchema = z.array(
    z.object({ name: z.string(), portrait: z.string() })
)

export async function fetchOverwatch(): Promise<CategoryResult> {
    const heroes = await fetchJson(
        new URL('https://overfast-api.tekrop.fr/heroes'),
        heroesSchema
    )

    const characters = heroes
        .map(({ name, portrait }) => ({ name, remoteUrl: portrait }))
        .sort(byName)

    console.log(`Overwatch: ${characters.length} heroes`)
    return {
        meta: {
            slug: 'overwatch',
            name: 'Overwatch',
            exportName: 'overwatchCharacters',
            imageType: 'character',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Overwatch_2_logo.svg/400px-Overwatch_2_logo.svg.png',
        },
        characters,
    }
}
