import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const charactersSchema = z.object({
    items: z.array(z.object({ image: z.string(), name: z.string() })),
})

export async function fetchDragonBall(): Promise<CategoryResult> {
    const url = new URL('https://dragonball-api.com/api/characters')
    url.searchParams.set('limit', '100')
    const { items } = await fetchJson(url, charactersSchema)

    const characters = items
        .map(({ image, name }) => ({ name, remoteUrl: image }))
        .sort(byName)

    console.log(`Dragon Ball: ${characters.length} characters`)
    return {
        characters,
        meta: {
            exportName: 'dragonBallCharacters',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/9/9b/Dragon_Ball_Z_Logo.png',
            imageType: 'poster',
            name: 'Dragon Ball',
            slug: 'dragon-ball',
        },
    }
}
