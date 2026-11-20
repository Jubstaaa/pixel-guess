import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const LIMIT = 50

const charactersSchema = z.array(
    z.object({ name: z.string(), image: z.string() })
)

export async function fetchHarryPotter(): Promise<CategoryResult> {
    const all = await fetchJson(
        new URL('https://hp-api.onrender.com/api/characters'),
        charactersSchema
    )

    const characters = all
        .filter((c) => c.image)
        .slice(0, LIMIT)
        .map((c) => ({ name: c.name, remoteUrl: c.image }))
        .sort(byName)

    console.log(`Harry Potter: ${characters.length} characters`)
    return {
        meta: {
            slug: 'harry-potter',
            name: 'Harry Potter',
            exportName: 'harryPotterCharacters',
            imageType: 'poster',
            iconUrl:
                'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Harry-Potter-Logo.png',
        },
        characters,
    }
}
