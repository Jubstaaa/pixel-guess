import { describe, expect, test } from 'bun:test'

import { pokemonListSchema, toPokemonCharacters } from './pokemon'

describe('toPokemonCharacters', () => {
    test('derives the artwork id from the resource URL and formats the name', () => {
        const payload = pokemonListSchema.parse({
            count: 1302,
            results: [
                {
                    name: 'mr-mime',
                    url: 'https://pokeapi.co/api/v2/pokemon/122/',
                },
            ],
        })

        expect(toPokemonCharacters(payload)).toEqual([
            {
                name: 'Mr mime',
                remoteUrl:
                    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/122.png',
            },
        ])
    })

    test('throws when a resource URL has no id', () => {
        const payload = pokemonListSchema.parse({
            results: [{ name: 'ghost', url: 'https://pokeapi.co/' }],
        })

        expect(() => toPokemonCharacters(payload)).toThrow(/no id/)
    })
})
