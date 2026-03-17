import type { Category } from '../types'

import {
    dota2Characters,
    dragonBallCharacters,
    flagCharacters,
    fortniteCharacters,
    genshinCharacters,
    leagueOfLegendsCharacters,
    narutoCharacters,
    overwatchCharacters,
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
        slug: 'flags',
        name: 'Flags',
        icon: 'https://flagcdn.com/w160/un.png',
        characterCount: flagCharacters.length,
    },
    {
        slug: 'dragon-ball',
        name: 'Dragon Ball',
        icon: 'https://dragonball-api.com/characters/goku_normal.webp',
        characterCount: dragonBallCharacters.length,
    },
    {
        slug: 'naruto',
        name: 'Naruto',
        icon: 'https://static.wikia.nocookie.net/naruto/images/d/d6/Naruto_Part_I.png',
        characterCount: narutoCharacters.length,
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
        slug: 'overwatch',
        name: 'Overwatch',
        icon: 'https://d15f34w2p8l1cc.cloudfront.net/overwatch/985b06beae46b7ba3ca87d1512d0fc62ca7f206ceca58ef16fc44d43a1cc84ed.png',
        characterCount: overwatchCharacters.length,
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
        slug: 'rick-and-morty',
        name: 'Rick & Morty',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Rick_and_Morty.svg',
        characterCount: rickAndMortyCharacters.length,
    },
    {
        slug: 'dota-2',
        name: 'Dota 2',
        icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png',
        characterCount: dota2Characters.length,
    },
]

export const charactersByCategory: Record<
    string,
    typeof leagueOfLegendsCharacters
> = {
    pokemon: pokemonCharacters,
    flags: flagCharacters,
    'dragon-ball': dragonBallCharacters,
    naruto: narutoCharacters,
    'league-of-legends': leagueOfLegendsCharacters,
    valorant: valorantCharacters,
    overwatch: overwatchCharacters,
    fortnite: fortniteCharacters,
    'genshin-impact': genshinCharacters,
    'rick-and-morty': rickAndMortyCharacters,
    'dota-2': dota2Characters,
}
