import type { Category } from '../types'

import {
    dota2Characters,
    flagCharacters,
    fortniteCharacters,
    genshinCharacters,
    leagueOfLegendsCharacters,
    pokemonCharacters,
    rickAndMortyCharacters,
    valorantCharacters,
} from './characters'

export const categories: Category[] = [
    {
        slug: 'pokemon',
        name: 'Pokémon',
        icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png',
        characterCount: pokemonCharacters.length,
    },
    {
        slug: 'league-of-legends',
        name: 'League of Legends',
        icon: 'https://vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png',
        characterCount: leagueOfLegendsCharacters.length,
    },
    {
        slug: 'valorant',
        name: 'Valorant',
        icon: 'https://static.cdnlogo.com/logos/v/87/valorant.svg',
        characterCount: valorantCharacters.length,
    },
    {
        slug: 'fortnite',
        name: 'Fortnite',
        icon: 'https://fortnite-api.com/images/cosmetics/br/character_jonesyorangefncs/icon.png',
        characterCount: fortniteCharacters.length,
    },
    {
        slug: 'genshin-impact',
        name: 'Genshin Impact',
        icon: 'https://gi.yatta.moe/assets/UI/UI_AvatarIcon_PlayerGirl.png',
        characterCount: genshinCharacters.length,
    },
    {
        slug: 'dota-2',
        name: 'Dota 2',
        icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png',
        characterCount: dota2Characters.length,
    },
    {
        slug: 'rick-and-morty',
        name: 'Rick & Morty',
        icon: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        characterCount: rickAndMortyCharacters.length,
    },
    {
        slug: 'flags',
        name: 'Flags',
        icon: 'https://flagcdn.com/w160/un.png',
        characterCount: flagCharacters.length,
    },
]

export const charactersByCategory: Record<
    string,
    typeof leagueOfLegendsCharacters
> = {
    pokemon: pokemonCharacters,
    'league-of-legends': leagueOfLegendsCharacters,
    valorant: valorantCharacters,
    fortnite: fortniteCharacters,
    'genshin-impact': genshinCharacters,
    'dota-2': dota2Characters,
    'rick-and-morty': rickAndMortyCharacters,
    flags: flagCharacters,
}
