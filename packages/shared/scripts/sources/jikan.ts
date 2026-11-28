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
                images: z
                    .object({
                        jpg: z
                            .object({ image_url: z.string().nullish() })
                            .optional(),
                    })
                    .optional(),
                name: z.string(),
            }),
            favorites: z.number(),
        })
    ),
})

interface JikanCategory {
    animeId: number
    label: string
    limit: number
    meta: CategoryMeta
}

export function toJikanCharacters(
    payload: z.output<typeof jikanCharactersSchema>,
    limit: number
): CharacterEntry[] {
    return payload.data
        .flatMap(({ character, favorites }) => {
            const imageUrl = character.images?.jpg?.image_url
            return imageUrl
                ? [{ favorites, imageUrl, name: character.name }]
                : []
        })
        .sort((a, b) => b.favorites - a.favorites)
        .slice(0, limit)
        .map(({ imageUrl, name }) => ({
            name: toDisplayName(name),
            remoteUrl: imageUrl,
        }))
        .sort(byName)
}

function animeMeta(
    slug: string,
    name: string,
    exportName: string,
    iconUrl: string
): CategoryMeta {
    return { exportName, iconUrl, imageType: 'poster', name, slug }
}

function toDisplayName(name: string): string {
    return name.includes(', ') ? name.split(', ').reverse().join(' ') : name
}

export const JIKAN_CATEGORIES: JikanCategory[] = [
    {
        animeId: 21,
        label: 'One Piece',
        limit: 60,
        meta: animeMeta(
            'one-piece',
            'One Piece',
            'onePieceCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/One-Piece-Logo.png'
        ),
    },
    {
        animeId: 16498,
        label: 'Attack on Titan',
        limit: 40,
        meta: animeMeta(
            'attack-on-titan',
            'Attack on Titan',
            'attackOnTitanCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2022/01/Attack-on-Titan-Logo.png'
        ),
    },
    {
        animeId: 38000,
        label: 'Demon Slayer',
        limit: 40,
        meta: animeMeta(
            'demon-slayer',
            'Demon Slayer',
            'demonSlayerCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/12/Demon-Slayer-Logo.png'
        ),
    },
    {
        animeId: 40748,
        label: 'Jujutsu Kaisen',
        limit: 40,
        meta: animeMeta(
            'jujutsu-kaisen',
            'Jujutsu Kaisen',
            'jujutsuKaisenCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2024/08/Jujutsu-Kaisen-Logo.png'
        ),
    },
    {
        animeId: 31964,
        label: 'My Hero Academia',
        limit: 40,
        meta: animeMeta(
            'my-hero-academia',
            'My Hero Academia',
            'myHeroAcademiaCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/My-Hero-Academia-Logo.png'
        ),
    },
    {
        animeId: 1535,
        label: 'Death Note',
        limit: 30,
        meta: animeMeta(
            'death-note',
            'Death Note',
            'deathNoteCharacters',
            'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2023/12/Death-Note-Logo.png'
        ),
    },
    {
        animeId: 5114,
        label: 'FMA Brotherhood',
        limit: 40,
        meta: animeMeta(
            'fullmetal-alchemist',
            'Fullmetal Alchemist',
            'fullmetalAlchemistCharacters',
            'https://images.weserv.nl/?url=media.themoviedb.org/t/p/w1280/1uxD6336yvySlaNqAuCl5XuGt3U.png'
        ),
    },
    {
        animeId: 11061,
        label: 'Hunter x Hunter',
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
    animeId,
    label,
    limit,
    meta,
}: JikanCategory): Promise<CategoryResult> {
    const payload = await fetchJson(
        new URL(`https://api.jikan.moe/v4/anime/${animeId}/characters`),
        jikanCharactersSchema
    )
    const characters = toJikanCharacters(payload, limit)

    console.log(`${label}: ${characters.length} characters`)
    return { characters, meta }
}
