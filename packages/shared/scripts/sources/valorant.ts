import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const agentsSchema = z.object({
    data: z.array(z.object({ displayName: z.string(), uuid: z.string() })),
})

export async function fetchValorant(): Promise<CategoryResult> {
    const url = new URL('https://valorant-api.com/v1/agents')
    url.searchParams.set('isPlayableCharacter', 'true')
    const { data } = await fetchJson(url, agentsSchema)

    const characters = data
        .map(({ displayName, uuid }) => ({
            name: displayName,
            remoteUrl: `https://media.valorant-api.com/agents/${uuid}/displayicon.png`,
        }))
        .sort(byName)

    console.log(`Valorant: ${characters.length} agents`)
    return {
        meta: {
            slug: 'valorant',
            name: 'Valorant',
            exportName: 'valorantCharacters',
            imageType: 'character',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version_%28cropped%29.png',
        },
        characters,
    }
}
