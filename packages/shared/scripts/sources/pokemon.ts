import { z } from 'zod'

import type { CategoryResult, CharacterEntry } from './category'

import { fetchJson } from './fetch-json'

const FIRST_GENERATION = 151

export const pokemonListSchema = z.object({
    results: z.array(z.object({ name: z.string(), url: z.string() })),
})

export async function fetchPokemon(): Promise<CategoryResult> {
    const url = new URL('https://pokeapi.co/api/v2/pokemon')
    url.searchParams.set('limit', '1025')
    const characters = toPokemonCharacters(
        await fetchJson(url, pokemonListSchema)
    )

    console.log(`Pokémon: ${characters.length} pokémon`)
    return {
        characters,
        meta: {
            exportName: 'pokemonCharacters',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/400px-International_Pok%C3%A9mon_logo.svg.png',
            imageType: 'poster',
            name: 'Pokémon',
            slug: 'pokemon',
        },
    }
}

export function toPokemonCharacters(
    payload: z.output<typeof pokemonListSchema>
): CharacterEntry[] {
    return payload.results.slice(0, FIRST_GENERATION).map(({ name, url }) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
        remoteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId(url)}.png`,
    }))
}

function pokemonId(resourceUrl: string): string {
    const id = new URL(resourceUrl).pathname.split('/').filter(Boolean).at(-1)
    if (!id) throw new Error(`Pokémon resource URL has no id: ${resourceUrl}`)
    return id
}
