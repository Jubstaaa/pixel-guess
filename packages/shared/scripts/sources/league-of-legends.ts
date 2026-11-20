import { z } from 'zod'

import { byName, type CategoryResult } from './category'
import { fetchJson } from './fetch-json'

const DDRAGON = 'https://ddragon.leagueoflegends.com'

const versionsSchema = z.array(z.string()).nonempty()
const championsSchema = z.object({
    data: z.record(z.string(), z.object({ name: z.string(), id: z.string() })),
})

export async function fetchLeagueOfLegends(): Promise<CategoryResult> {
    const [version] = await fetchJson(
        new URL('/api/versions.json', DDRAGON),
        versionsSchema
    )
    const { data } = await fetchJson(
        new URL(`/cdn/${version}/data/en_US/champion.json`, DDRAGON),
        championsSchema
    )

    const characters = Object.values(data)
        .map(({ name, id }) => ({
            name,
            remoteUrl: `${DDRAGON}/cdn/${version}/img/champion/${id}.png`,
        }))
        .sort(byName)

    console.log(`LoL: ${characters.length} champions (v${version})`)
    return {
        meta: {
            slug: 'league-of-legends',
            name: 'League of Legends',
            exportName: 'leagueOfLegendsCharacters',
            imageType: 'character',
            iconUrl:
                'https://images.weserv.nl/?url=vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png',
        },
        characters,
    }
}
