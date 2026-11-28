import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const heroesSchema = z.array(
    z.object({ localized_name: z.string(), name: z.string() })
)

export async function fetchDota2(): Promise<CategoryResult> {
    const heroes = await fetchJson(
        new URL('https://api.opendota.com/api/heroes'),
        heroesSchema
    )

    const characters = heroes
        .map(({ localized_name, name }) => ({
            name: localized_name,
            remoteUrl: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${name.replace('npc_dota_hero_', '')}.png`,
        }))
        .sort(byName)

    console.log(`Dota 2: ${characters.length} heroes`)
    return {
        characters,
        meta: {
            exportName: 'dota2Characters',
            iconUrl:
                'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png',
            imageType: 'character',
            name: 'Dota 2',
            slug: 'dota-2',
        },
    }
}
