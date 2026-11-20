import { z } from 'zod'

import { byName, type CategoryResult, type CharacterEntry } from './category'
import { fetchJson } from './fetch-json'

const COMPETITIONS = ['PL', 'PD', 'BL1', 'SA', 'FL1']

export const footballTeamsSchema = z.object({
    teams: z.array(
        z.object({
            id: z.number(),
            name: z.string(),
            crest: z.string().nullish(),
        })
    ),
})

export function toFootballCharacters(
    competitions: z.output<typeof footballTeamsSchema>[]
): CharacterEntry[] {
    const clubs = new Map<number, CharacterEntry>()
    for (const { teams } of competitions) {
        for (const { id, name, crest } of teams) {
            if (crest) clubs.set(id, { name, remoteUrl: crest })
        }
    }
    return [...clubs.values()].sort(byName)
}

export async function fetchFootball(apiKey: string): Promise<CategoryResult> {
    const competitions = await Promise.all(
        COMPETITIONS.map((code) =>
            fetchJson(
                new URL(
                    `https://api.football-data.org/v4/competitions/${code}/teams`
                ),
                footballTeamsSchema,
                { headers: { 'X-Auth-Token': apiKey } }
            )
        )
    )
    const characters = toFootballCharacters(competitions)

    console.log(`Football: ${characters.length} clubs`)
    return {
        meta: {
            slug: 'football',
            name: 'Football Clubs',
            exportName: 'footballCharacters',
            imageType: 'logo',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/1/1d/Football_Pallo_valmiina-cropped.jpg',
        },
        characters,
    }
}
