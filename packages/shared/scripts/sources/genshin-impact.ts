import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const avatarsSchema = z.object({
    data: z.object({
        items: z.record(
            z.string(),
            z.object({ icon: z.string(), name: z.string() })
        ),
    }),
})

export async function fetchGenshinImpact(): Promise<CategoryResult> {
    const { data } = await fetchJson(
        new URL('https://gi.yatta.moe/api/v2/en/avatar'),
        avatarsSchema
    )

    const characters = Object.values(data.items)
        .map(({ icon, name }) => ({
            name,
            remoteUrl: `https://gi.yatta.moe/assets/UI/${icon}.png`,
        }))
        .sort(byName)

    console.log(`Genshin Impact: ${characters.length} characters`)
    return {
        characters,
        meta: {
            exportName: 'genshinCharacters',
            iconUrl:
                'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2024/01/Genshin-Impact-Logo.png',
            imageType: 'character',
            name: 'Genshin Impact',
            slug: 'genshin-impact',
        },
    }
}
