import type { Category } from '../types'

import {
    dota2Characters,
    flagCharacters,
    leagueOfLegendsCharacters,
    valorantCharacters,
} from './characters'

export const categories: Category[] = [
    {
        slug: 'league-of-legends',
        name: 'League of Legends',
        icon: 'https://vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png',
        characterCount: leagueOfLegendsCharacters.length,
    },
    {
        slug: 'dota-2',
        name: 'Dota 2',
        icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png',
        characterCount: dota2Characters.length,
    },
    {
        slug: 'valorant',
        name: 'Valorant',
        icon: 'https://static.cdnlogo.com/logos/v/87/valorant.svg',
        characterCount: valorantCharacters.length,
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
    'league-of-legends': leagueOfLegendsCharacters,
    'dota-2': dota2Characters,
    valorant: valorantCharacters,
    flags: flagCharacters,
}
