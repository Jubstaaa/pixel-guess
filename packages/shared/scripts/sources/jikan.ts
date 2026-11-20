import { z } from 'zod'

import {
    byName,
    type CategoryMeta,
    type CategoryResult,
    type CharacterEntry,
} from './category'
import { fetchJson } from './fetch-json'

export const jikanCharactersSchema = z.object({
    data: z.array(
        z.object({
            character: z.object({
                name: z.string(),
                images: z
                    .object({
                        jpg: z
                            .object({ image_url: z.string().nullish() })
                            .optional(),
                    })
                    .optional(),
            }),
            favorites: z.number(),
        })
    ),
})

// MyAnimeList stores names as "Family, Given".
function toDisplayName(name: string): string {
    return name.includes(', ') ? name.split(', ').reverse().join(' ') : name
}

export function toJikanCharacters(
    payload: z.output<typeof jikanCharactersSchema>,
    limit: number
): CharacterEntry[] {
    return payload.data
        .flatMap(({ character, favorites }) => {
            const imageUrl = character.images?.jpg?.image_url
            return imageUrl
                ? [{ name: character.name, imageUrl, favorites }]
                : []
        })
        .sort((a, b) => b.favorites - a.favorites)
        .slice(0, limit)
        .map(({ name, imageUrl }) => ({
            name: toDisplayName(name),
            remoteUrl: imageUrl,
        }))
        .sort(byName)
}

interface JikanCategory {
    label: string
    animeId: number
    limit: number
    meta: CategoryMeta
}

function animeMeta(
    slug: string,
    name: string,
    exportName: string,
    iconUrl: string
): CategoryMeta {
    return { slug, name, exportName, imageType: 'poster', iconUrl }
}

export const JIKAN_CATEGORIES: JikanCategory[] = [
    {
        label: 'One Piece',
        animeId: 21,
        limit: 60,
        meta: animeMeta(
            'one-piece',
            'One Piece',
            'onePieceCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/One-Piece-Logo.png'
        ),
    },
    {
        label: 'Attack on Titan',
        animeId: 16498,
        limit: 40,
        meta: animeMeta(
            'attack-on-titan',
            'Attack on Titan',
            'attackOnTitanCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2022/01/Attack-on-Titan-Logo.png'
        ),
    },
    {
        label: 'Demon Slayer',
        animeId: 38000,
        limit: 40,
        meta: animeMeta(
            'demon-slayer',
            'Demon Slayer',
            'demonSlayerCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/12/Demon-Slayer-Logo.png'
        ),
    },
    {
        label: 'Jujutsu Kaisen',
        animeId: 40748,
        limit: 40,
        meta: animeMeta(
            'jujutsu-kaisen',
            'Jujutsu Kaisen',
            'jujutsuKaisenCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2024/08/Jujutsu-Kaisen-Logo.png'
        ),
    },
    {
        label: 'My Hero Academia',
        animeId: 31964,
        limit: 40,
        meta: animeMeta(
            'my-hero-academia',
            'My Hero Academia',
            'myHeroAcademiaCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/My-Hero-Academia-Logo.png'
        ),
    },
    {
        label: 'Death Note',
        animeId: 1535,
        limit: 30,
        meta: animeMeta(
            'death-note',
            'Death Note',
            'deathNoteCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2023/12/Death-Note-Logo.png'
        ),
    },
    {
        label: 'FMA Brotherhood',
        animeId: 5114,
        limit: 40,
        meta: animeMeta(
            'fullmetal-alchemist',
            'Fullmetal Alchemist',
            'fullmetalAlchemistCharacters',
            'https://images.weserv.nl/?url=media.themoviedb.org/t/p/w1280/1uxD6336yvySlaNqAuCl5XuGt3U.png'
        ),
    },
    {
        label: 'Hunter x Hunter',
        animeId: 11061,
        limit: 40,
        meta: animeMeta(
            'hunter-x-hunter',
            'Hunter x Hunter',
            'hunterXHunterCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/08/Hunter-x-Hunter-Logo-1.png'
        ),
    },
]

export async function fetchJikanCategory({
    label,
    animeId,
    limit,
    meta,
}: JikanCategory): Promise<CategoryResult> {
    const payload = await fetchJson(
        new URL(`https://api.jikan.moe/v4/anime/${animeId}/characters`),
        jikanCharactersSchema
    )
    const characters = toJikanCharacters(payload, limit)

    console.log(`${label}: ${characters.length} characters`)
    return { meta, characters }
}
