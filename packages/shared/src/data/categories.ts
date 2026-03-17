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
        icon: 'https://upload.wikimedia.org/wikipedia/commons/9/98/International_Pok%C3%A9mon_logo.svg',
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
        icon: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version_%28cropped%29.png',
        characterCount: valorantCharacters.length,
    },
    {
        slug: 'fortnite',
        name: 'Fortnite',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/7/7c/Fortnite_F_lettermark_logo.png',
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
        icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Rick_and_Morty.svg',
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
