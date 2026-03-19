import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { join } from 'path'

import PQueue from 'p-queue'
import pRetry from 'p-retry'
import sharp from 'sharp'

const OUT_DIR = join(import.meta.dir, '../src/data/characters')
const IMAGES_DIR = join(import.meta.dir, '../assets/images')
const MOBILE_GENERATED_DIR = join(import.meta.dir, '../../../apps/mobile/generated')

const MAX_IMAGE_SIZE = 400
const IMAGE_QUALITY = 80

interface CharacterEntry {
    name: string
    remoteUrl: string
}

interface CategoryMeta {
    slug: string
    name: string
    exportName: string
    imageType: 'character' | 'poster' | 'logo'
    iconUrl: string
}

interface CategoryResult {
    meta: CategoryMeta
    characters: CharacterEntry[]
}

interface DownloadTask {
    url: string
    outPath: string
    localKey: string
}

async function fetchJson(url: string, options?: RequestInit): Promise<any> {
    return pRetry(
        async () => {
            const r = await fetch(url, options)
            if (r.status === 429) throw new Error(`Rate limited: ${url}`)
            if (!r.ok) throw new pRetry.AbortError(`HTTP ${r.status}: ${url}`)
            return r.json()
        },
        { retries: 3, minTimeout: 2000, factor: 2, onFailedAttempt: (e) => console.warn(`  ↻ ${url} attempt ${e.attemptNumber} failed`) },
    )
}

async function fetchCategory(label: string, fn: () => Promise<CategoryResult>): Promise<CategoryResult | null> {
    try {
        return await pRetry(fn, {
            retries: 2,
            minTimeout: 3000,
            factor: 2,
            onFailedAttempt: (e) => console.warn(`  ↻ ${label} attempt ${e.attemptNumber} failed`),
        })
    } catch (e) {
        console.error(`✗ ${label} failed: ${(e as Error).message}`)
        return null
    }
}

function toFileName(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'unnamed'
}

async function downloadBatch(tasks: DownloadTask[]): Promise<DownloadTask[]> {
    const failed: DownloadTask[] = []
    let completed = 0
    const queue = new PQueue({ concurrency: 30 })

    const jobs = tasks.map((task) =>
        queue.add(async () => {
            try {
                await pRetry(
                    async () => {
                        const res = await fetch(task.url, {
                            headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PixelGuess/1.0)' },
                        })
                        if (res.status === 429) throw new Error('rate limited')
                        if (!res.ok) throw new pRetry.AbortError(`HTTP ${res.status}`)
                        const buf = Buffer.from(await res.arrayBuffer())
                        await sharp(buf)
                            .resize(MAX_IMAGE_SIZE, MAX_IMAGE_SIZE, { fit: 'inside', withoutEnlargement: true })
                            .webp({ quality: IMAGE_QUALITY })
                            .toFile(task.outPath)
                    },
                    { retries: 3, minTimeout: 1000, factor: 2 },
                )
            } catch {
                failed.push(task)
            }
            completed++
            if (completed % 200 === 0 || completed === tasks.length) {
                process.stdout.write(`\r  ${completed}/${tasks.length}`)
            }
        }),
    )

    await Promise.all(jobs)
    console.log('')
    return failed
}

const MAX_RETRY_ROUNDS = 3

async function downloadAll(tasks: DownloadTask[]): Promise<Set<string>> {
    let remaining = await downloadBatch(tasks)

    for (let round = 1; round <= MAX_RETRY_ROUNDS && remaining.length > 0; round++) {
        console.log(`\n⚠ ${remaining.length} failed — retry round ${round}/${MAX_RETRY_ROUNDS}...`)
        remaining = await downloadBatch(remaining)
    }

    if (remaining.length > 0) {
        console.warn(`\n⚠ ${remaining.length} images permanently failed (will be excluded):`)
        for (const t of remaining) console.warn(`  - ${t.localKey} (${t.url})`)
    }

    return new Set(remaining.map((t) => t.localKey))
}

// ━━━ DATA FETCHERS ━━━

async function fetchLol(): Promise<CategoryResult> {
    const versions: string[] = await fetch(
        'https://ddragon.leagueoflegends.com/api/versions.json',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
    const version = versions[0]
    const data = await fetch(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`,
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = Object.values(data.data as Record<string, { name: string; id: string }>)
        .map(({ name, id }) => ({
            name,
            remoteUrl: `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`LoL: ${characters.length} champions (v${version})`)
    return {
        meta: {
            slug: 'league-of-legends',
            name: 'League of Legends',
            exportName: 'leagueOfLegendsCharacters',
            imageType: 'character',
            iconUrl: 'https://images.weserv.nl/?url=vignette.wikia.nocookie.net/leagueoflegends/images/1/12/League_of_Legends_Icon.png',
        },
        characters,
    }
}

async function fetchDota2(): Promise<CategoryResult> {
    const heroes: { localized_name: string; name: string }[] = await fetch(
        'https://api.opendota.com/api/heroes',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = heroes
        .map(({ localized_name, name }) => ({
            name: localized_name,
            remoteUrl: `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${name.replace('npc_dota_hero_', '')}.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Dota 2: ${characters.length} heroes`)
    return {
        meta: {
            slug: 'dota-2',
            name: 'Dota 2',
            exportName: 'dota2Characters',
            imageType: 'character',
            iconUrl: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png',
        },
        characters,
    }
}

async function fetchValorant(): Promise<CategoryResult> {
    const data = await fetch(
        'https://valorant-api.com/v1/agents?isPlayableCharacter=true',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = (data.data as { displayName: string; uuid: string }[])
        .map(({ displayName, uuid }) => ({
            name: displayName,
            remoteUrl: `https://media.valorant-api.com/agents/${uuid}/displayicon.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Valorant: ${characters.length} agents`)
    return {
        meta: {
            slug: 'valorant',
            name: 'Valorant',
            exportName: 'valorantCharacters',
            imageType: 'character',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fc/Valorant_logo_-_pink_color_version_%28cropped%29.png',
        },
        characters,
    }
}

async function fetchFlags(): Promise<CategoryResult> {
    const codes: Record<string, string> = await fetch(
        'https://flagcdn.com/en/codes.json',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const exclude = new Set([
        'ac', 'cp', 'dg', 'ea', 'eu', 'hm', 'ic', 'sh', 'sj', 'ta', 'un',
        'xk', 'bv', 'aq', 'tf', 'gs', 'io', 'um',
    ])

    const characters = Object.entries(codes)
        .filter(([code]) => code.length === 2 && !exclude.has(code))
        .map(([code, name]) => ({
            name,
            remoteUrl: `https://flagcdn.com/w1280/${code}.webp`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Flags: ${characters.length} countries`)
    return {
        meta: {
            slug: 'flags',
            name: 'Flags',
            exportName: 'flagCharacters',
            imageType: 'logo',
            iconUrl: 'https://flagcdn.com/w160/un.png',
        },
        characters,
    }
}

async function fetchPokemon(): Promise<CategoryResult> {
    const data = await fetch(
        'https://pokeapi.co/api/v2/pokemon?limit=1025',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = (data.results as { name: string; url: string }[])
        .slice(0, 151)
        .map(({ name, url }) => {
            const id = url.split('/').filter(Boolean).pop()!
            return {
                name: name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' '),
                remoteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
            }
        })

    console.log(`Pokémon: ${characters.length} pokémon`)
    return {
        meta: {
            slug: 'pokemon',
            name: 'Pokémon',
            exportName: 'pokemonCharacters',
            imageType: 'poster',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/International_Pok%C3%A9mon_logo.svg/400px-International_Pok%C3%A9mon_logo.svg.png',
        },
        characters,
    }
}


async function fetchGenshin(): Promise<CategoryResult> {
    const data = await fetch('https://gi.yatta.moe/api/v2/en/avatar').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = Object.values(
        data.data.items as Record<string, { name: string; icon: string }>,
    )
        .map(({ name, icon }) => ({
            name,
            remoteUrl: `https://gi.yatta.moe/assets/UI/${icon}.png`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Genshin Impact: ${characters.length} characters`)
    return {
        meta: {
            slug: 'genshin-impact',
            name: 'Genshin Impact',
            exportName: 'genshinCharacters',
            imageType: 'character',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2024/01/Genshin-Impact-Logo.png',
        },
        characters,
    }
}

async function fetchRickAndMorty(): Promise<CategoryResult> {
    const first = await fetch('https://rickandmortyapi.com/api/character').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
    const pages: number = first.info.pages

    const results = [...first.results]
    await Promise.all(
        Array.from({ length: pages - 1 }, (_, i) =>
            fetch(`https://rickandmortyapi.com/api/character?page=${i + 2}`)
                .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
                .then((d) => results.push(...d.results)),
        ),
    )

    const characters = (results as { name: string; image: string; episode: string[] }[])
        .filter((c) => c.episode.length >= 3)
        .map(({ name, image }) => ({ name, remoteUrl: image }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Rick & Morty: ${characters.length} characters`)
    return {
        meta: {
            slug: 'rick-and-morty',
            name: 'Rick & Morty',
            exportName: 'rickAndMortyCharacters',
            imageType: 'poster',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Rick_and_Morty.svg/400px-Rick_and_Morty.svg.png',
        },
        characters,
    }
}

async function fetchOverwatch(): Promise<CategoryResult> {
    const data = await fetch('https://overfast-api.tekrop.fr/heroes').then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = (data as { name: string; portrait: string }[])
        .map(({ name, portrait }) => ({ name, remoteUrl: portrait }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Overwatch: ${characters.length} heroes`)
    return {
        meta: {
            slug: 'overwatch',
            name: 'Overwatch',
            exportName: 'overwatchCharacters',
            imageType: 'character',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Overwatch_2_logo.svg/400px-Overwatch_2_logo.svg.png',
        },
        characters,
    }
}

async function fetchDragonBall(): Promise<CategoryResult> {
    const data = await fetch(
        'https://dragonball-api.com/api/characters?limit=100',
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    const characters = (data.items as { name: string; image: string }[])
        .map(({ name, image }) => ({ name, remoteUrl: image }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Dragon Ball: ${characters.length} characters`)
    return {
        meta: {
            slug: 'dragon-ball',
            name: 'Dragon Ball',
            exportName: 'dragonBallCharacters',
            imageType: 'poster',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Dragon_Ball_Z_Logo.png',
        },
        characters,
    }
}

type TmdbItem = { title?: string; name?: string; poster_path?: string; profile_path?: string }

async function fetchTmdb(endpoint: string, apiKey: string, pages: number): Promise<TmdbItem[]> {
    const results: TmdbItem[] = []
    await Promise.all(
        Array.from({ length: pages }, (_, i) =>
            fetch(
                `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=en-US&page=${i + 1}`,
            )
                .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
                .then((d) => results.push(...(d.results ?? []))),
        ),
    )
    return results
}

async function fetchTmdbDiscover(endpoint: string, apiKey: string, pages: number, extraParams: string): Promise<TmdbItem[]> {
    const results: TmdbItem[] = []
    await Promise.all(
        Array.from({ length: pages }, (_, i) =>
            fetch(
                `https://api.themoviedb.org/3/${endpoint}?api_key=${apiKey}&language=en-US&sort_by=popularity.desc&page=${i + 1}${extraParams}`,
            )
                .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
                .then((d) => results.push(...(d.results ?? []))),
        ),
    )
    return results
}

async function fetchMovies(apiKey: string): Promise<CategoryResult> {
    const results = await fetchTmdbDiscover(
        'discover/movie',
        apiKey,
        5,
        '&vote_count.gte=1000&with_original_language=en',
    )

    const characters = results
        .filter((m) => m.poster_path)
        .map((m) => ({
            name: m.title!,
            remoteUrl: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Movies: ${characters.length} movies`)
    return {
        meta: {
            slug: 'movies',
            name: 'Movies',
            exportName: 'movieCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png',
        },
        characters,
    }
}

async function fetchTvShows(apiKey: string): Promise<CategoryResult> {
    const results = await fetchTmdbDiscover(
        'discover/tv',
        apiKey,
        5,
        '&vote_count.gte=500&with_original_language=en',
    )

    const characters = results
        .filter((s) => s.poster_path)
        .map((s) => ({
            name: s.name!,
            remoteUrl: `https://image.tmdb.org/t/p/w500${s.poster_path}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`TV Shows: ${characters.length} shows`)
    return {
        meta: {
            slug: 'tv-shows',
            name: 'TV Shows',
            exportName: 'tvShowCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png',
        },
        characters,
    }
}

async function fetchPeople(apiKey: string): Promise<CategoryResult> {
    const results = await fetchTmdb('person/popular', apiKey, 3)

    const characters = results
        .filter((p) => p.profile_path)
        .slice(0, 50)
        .map((p) => ({
            name: p.name!,
            remoteUrl: `https://image.tmdb.org/t/p/w500${p.profile_path}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`People: ${characters.length} people`)
    return {
        meta: {
            slug: 'people',
            name: 'People',
            exportName: 'peopleCharacters',
            imageType: 'poster',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/400px-Tmdb.new.logo.svg.png',
        },
        characters,
    }
}

async function fetchNaruto(): Promise<CategoryResult> {
    const first = await fetchJson('https://dattebayo-api.onrender.com/characters?limit=100')
    const results = [...first.characters]
    const totalPages = Math.ceil(first.total / 100)

    await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
            fetchJson(`https://dattebayo-api.onrender.com/characters?limit=100&page=${i + 2}`)
                .then((d) => results.push(...d.characters)),
        ),
    )

    const characters = (results as { name: string; images: string[] }[])
        .filter((c) => c.images.length > 0)
        .slice(0, 60)
        .map(({ name, images }) => ({ name, remoteUrl: images[0] }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Naruto: ${characters.length} characters`)
    return {
        meta: {
            slug: 'naruto',
            name: 'Naruto',
            exportName: 'narutoCharacters',
            imageType: 'poster',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Naruto_logo.svg/400px-Naruto_logo.svg.png',
        },
        characters,
    }
}

const BRANDS = [
    { name: 'Apple', domain: 'apple.com' },
    { name: 'Google', domain: 'google.com' },
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'Amazon', domain: 'amazon.com' },
    { name: 'Meta', domain: 'meta.com' },
    { name: 'Netflix', domain: 'netflix.com' },
    { name: 'Spotify', domain: 'spotify.com' },
    { name: 'YouTube', domain: 'youtube.com' },
    { name: 'Instagram', domain: 'instagram.com' },
    { name: 'Twitter', domain: 'twitter.com' },
    { name: 'TikTok', domain: 'tiktok.com' },
    { name: 'Snapchat', domain: 'snapchat.com' },
    { name: 'WhatsApp', domain: 'whatsapp.com' },
    { name: 'LinkedIn', domain: 'linkedin.com' },
    { name: 'Reddit', domain: 'reddit.com' },
    { name: 'Twitch', domain: 'twitch.tv' },
    { name: 'Discord', domain: 'discord.com' },
    { name: 'Tesla', domain: 'tesla.com' },
    { name: 'Nike', domain: 'nike.com' },
    { name: 'Adidas', domain: 'adidas.com' },
    { name: 'Puma', domain: 'puma.com' },
    { name: 'Coca-Cola', domain: 'coca-cola.com' },
    { name: 'Pepsi', domain: 'pepsi.com' },
    { name: "McDonald's", domain: 'mcdonalds.com' },
    { name: 'Starbucks', domain: 'starbucks.com' },
    { name: 'KFC', domain: 'kfc.com' },
    { name: 'Burger King', domain: 'burgerking.com' },
    { name: 'Subway', domain: 'subway.com' },
    { name: 'Domino\'s', domain: 'dominos.com' },
    { name: 'Disney', domain: 'disney.com' },
    { name: 'Marvel', domain: 'marvel.com' },
    { name: 'Nintendo', domain: 'nintendo.com' },
    { name: 'PlayStation', domain: 'playstation.com' },
    { name: 'Xbox', domain: 'xbox.com' },
    { name: 'Steam', domain: 'steampowered.com' },
    { name: 'Epic Games', domain: 'epicgames.com' },
    { name: 'EA Sports', domain: 'ea.com' },
    { name: 'Ubisoft', domain: 'ubisoft.com' },
    { name: 'BMW', domain: 'bmw.com' },
    { name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
    { name: 'Audi', domain: 'audi.com' },
    { name: 'Volkswagen', domain: 'vw.com' },
    { name: 'Toyota', domain: 'toyota.com' },
    { name: 'Ferrari', domain: 'ferrari.com' },
    { name: 'Lamborghini', domain: 'lamborghini.com' },
    { name: 'Porsche', domain: 'porsche.com' },
    { name: 'Ford', domain: 'ford.com' },
    { name: 'Samsung', domain: 'samsung.com' },
    { name: 'Sony', domain: 'sony.com' },
    { name: 'LG', domain: 'lg.com' },
    { name: 'Intel', domain: 'intel.com' },
    { name: 'Nvidia', domain: 'nvidia.com' },
    { name: 'AMD', domain: 'amd.com' },
    { name: 'Visa', domain: 'visa.com' },
    { name: 'Mastercard', domain: 'mastercard.com' },
    { name: 'PayPal', domain: 'paypal.com' },
    { name: 'Airbnb', domain: 'airbnb.com' },
    { name: 'Uber', domain: 'uber.com' },
    { name: 'Shopify', domain: 'shopify.com' },
]

async function fetchBrands(): Promise<CategoryResult> {
    const characters = BRANDS
        .map(({ name, domain }) => ({
            name,
            remoteUrl: `https://img.logo.dev/${domain}?token=pk_eQWznTEVSQWtTwGzi_p5Qg&format=png&theme=dark`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Brands: ${characters.length} brands`)
    return {
        meta: {
            slug: 'brands',
            name: 'Brands',
            exportName: 'brandCharacters',
            imageType: 'logo',
            iconUrl: 'https://img.logo.dev/google.com?token=pk_eQWznTEVSQWtTwGzi_p5Qg&format=png',
        },
        characters,
    }
}

async function fetchFootball(apiKey: string): Promise<CategoryResult> {
    const competitions = ['PL', 'PD', 'BL1', 'SA', 'FL1']
    const teamMap = new Map<number, { name: string; crest: string }>()

    await Promise.all(
        competitions.map((code) =>
            fetchJson(`https://api.football-data.org/v4/competitions/${code}/teams`, {
                headers: { 'X-Auth-Token': apiKey },
            })
                .then((d) => {
                    if (d.teams) {
                        for (const t of d.teams as { id: number; name: string; crest: string }[]) {
                            if (t.crest) teamMap.set(t.id, { name: t.name, crest: t.crest })
                        }
                    }
                }),
        ),
    )

    const characters = Array.from(teamMap.values())
        .map(({ name, crest }) => ({ name, remoteUrl: crest }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Football: ${characters.length} clubs`)
    return {
        meta: {
            slug: 'football',
            name: 'Football Clubs',
            exportName: 'footballCharacters',
            imageType: 'logo',
            iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Football_Pallo_valmiina-cropped.jpg',
        },
        characters,
    }
}

async function fetchJikanAnime(animeId: number, limit: number): Promise<CharacterEntry[]> {
    const data = await fetch(
        `https://api.jikan.moe/v4/anime/${animeId}/characters`,
    ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })

    return (data.data as { character: { name: string; images: { jpg: { image_url: string } } }; favorites: number }[])
        .filter((c) => c.character.images?.jpg?.image_url)
        .sort((a, b) => b.favorites - a.favorites)
        .slice(0, limit)
        .map((c) => ({
            name: c.character.name.includes(', ')
                ? c.character.name.split(', ').reverse().join(' ')
                : c.character.name,
            remoteUrl: c.character.images.jpg.image_url,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
}

async function fetchOnePiece(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(21, 60)
    console.log(`One Piece: ${characters.length} characters`)
    return {
        meta: {
            slug: 'one-piece',
            name: 'One Piece',
            exportName: 'onePieceCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/One-Piece-Logo.png',
        },
        characters,
    }
}

async function fetchAttackOnTitan(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(16498, 40)
    console.log(`Attack on Titan: ${characters.length} characters`)
    return {
        meta: {
            slug: 'attack-on-titan',
            name: 'Attack on Titan',
            exportName: 'attackOnTitanCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2022/01/Attack-on-Titan-Logo.png',
        },
        characters,
    }
}

async function fetchDemonSlayer(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(38000, 40)
    console.log(`Demon Slayer: ${characters.length} characters`)
    return {
        meta: {
            slug: 'demon-slayer',
            name: 'Demon Slayer',
            exportName: 'demonSlayerCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/12/Demon-Slayer-Logo.png',
        },
        characters,
    }
}

async function fetchJujutsuKaisen(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(40748, 40)
    console.log(`Jujutsu Kaisen: ${characters.length} characters`)
    return {
        meta: {
            slug: 'jujutsu-kaisen',
            name: 'Jujutsu Kaisen',
            exportName: 'jujutsuKaisenCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2024/08/Jujutsu-Kaisen-Logo.png',
        },
        characters,
    }
}

async function fetchMyHeroAcademia(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(31964, 40)
    console.log(`My Hero Academia: ${characters.length} characters`)
    return {
        meta: {
            slug: 'my-hero-academia',
            name: 'My Hero Academia',
            exportName: 'myHeroAcademiaCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/09/My-Hero-Academia-Logo.png',
        },
        characters,
    }
}

async function fetchDeathNote(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(1535, 30)
    console.log(`Death Note: ${characters.length} characters`)
    return {
        meta: {
            slug: 'death-note',
            name: 'Death Note',
            exportName: 'deathNoteCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2023/12/Death-Note-Logo.png',
        },
        characters,
    }
}

async function fetchFullmetalAlchemist(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(5114, 40)
    console.log(`FMA Brotherhood: ${characters.length} characters`)
    return {
        meta: {
            slug: 'fullmetal-alchemist',
            name: 'Fullmetal Alchemist',
            exportName: 'fullmetalAlchemistCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=media.themoviedb.org/t/p/w1280/1uxD6336yvySlaNqAuCl5XuGt3U.png',
        },
        characters,
    }
}

async function fetchHunterXHunter(): Promise<CategoryResult> {
    const characters = await fetchJikanAnime(11061, 40)
    console.log(`Hunter x Hunter: ${characters.length} characters`)
    return {
        meta: {
            slug: 'hunter-x-hunter',
            name: 'Hunter x Hunter',
            exportName: 'hunterXHunterCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/08/Hunter-x-Hunter-Logo-1.png',
        },
        characters,
    }
}

async function fetchAnimeSeries(tmdbApiKey: string): Promise<CategoryResult> {
    const results: { name: string; poster_path: string | null }[] = []
    for (let page = 1; page <= 4; page++) {
        const data = await fetch(
            `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbApiKey}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`,
        ).then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
        results.push(...(data.results ?? []))
    }

    const characters = results
        .filter((a) => a.poster_path)
        .slice(0, 80)
        .map((a) => ({
            name: a.name,
            remoteUrl: `https://image.tmdb.org/t/p/w500${a.poster_path}`,
        }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Anime Series: ${characters.length} anime`)
    return {
        meta: {
            slug: 'anime-series',
            name: 'Anime Series',
            exportName: 'animeSeriesCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/04/Crunchyroll-Logo.png',
        },
        characters,
    }
}

async function fetchHarryPotter(): Promise<CategoryResult> {
    const data = await fetchJson('https://hp-api.onrender.com/api/characters')
    const characters = (data as { name: string; image: string }[])
        .filter((c) => c.image)
        .slice(0, 50)
        .map((c) => ({ name: c.name, remoteUrl: c.image }))
        .sort((a, b) => a.name.localeCompare(b.name))

    console.log(`Harry Potter: ${characters.length} characters`)
    return {
        meta: {
            slug: 'harry-potter',
            name: 'Harry Potter',
            exportName: 'harryPotterCharacters',
            imageType: 'poster',
            iconUrl: 'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Harry-Potter-Logo.png',
        },
        characters,
    }
}

// ━━━ SERIALIZATION ━━━

const PRINT_WIDTH = 80

function serializeString(s: string): string {
    if (s.includes("'")) return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
    return `'${s.replace(/\\/g, '\\\\')}'`
}

function serializeCharacters(
    exportName: string,
    chars: { name: string; localKey: string }[],
): string {
    const header = `// Auto-generated by scripts/generate-characters.ts — do not edit manually
import type { Character } from '../../types'

`
    const items = chars.map(({ name, localKey }) => {
        const nameStr = serializeString(name)
        const urlStr = serializeString(localKey)
        const urlLine = `        imageUrl: ${urlStr},`
        const urlFormatted =
            urlLine.length > PRINT_WIDTH
                ? `        imageUrl:\n            ${urlStr},`
                : urlLine
        return `    {\n        name: ${nameStr},\n${urlFormatted}\n    }`
    })
    const array = items.length === 0 ? '[]' : `[\n${items.join(',\n')},\n]`
    return header + `export const ${exportName}: Character[] = ${array}\n`
}

// ━━━ OUTPUT GENERATORS ━━━

const CATEGORY_ORDER = [
    'movies', 'tv-shows', 'anime-series', 'pokemon', 'harry-potter',
    'football', 'brands', 'flags', 'people', 'dragon-ball', 'naruto',
    'one-piece', 'attack-on-titan', 'demon-slayer', 'jujutsu-kaisen',
    'death-note', 'my-hero-academia', 'fullmetal-alchemist', 'hunter-x-hunter',
    'league-of-legends', 'valorant', 'dota-2', 'overwatch',
    'genshin-impact', 'rick-and-morty',
]

function writeCategoriesFile(results: CategoryResult[]) {
    const sorted = CATEGORY_ORDER
        .map((slug) => results.find((r) => r.meta.slug === slug)!)
        .filter(Boolean)

    const imports = sorted
        .map((r) => `    ${r.meta.exportName},`)
        .join('\n')

    const entries = sorted
        .map((r) => {
            const iconKey = serializeString(`categories/${r.meta.slug}.webp`)
            return `    {
        slug: '${r.meta.slug}',
        name: ${serializeString(r.meta.name)},
        icon: ${iconKey},
        characterCount: ${r.meta.exportName}.length,
        imageType: '${r.meta.imageType}',
    }`
        })
        .join(',\n')

    const charsByCategory = sorted
        .map((r) => `    '${r.meta.slug}': ${r.meta.exportName},`)
        .join('\n')

    const content = `// Auto-generated by scripts/generate-characters.ts — do not edit manually
import type { Category } from '../types'

import {
${imports}
} from './characters'

export const categories: Category[] = [
${entries},
]

export const charactersByCategory: Record<
    string,
    typeof ${sorted[0].meta.exportName}
> = {
${charsByCategory}
}
`

    writeFileSync(join(import.meta.dir, '../src/data/categories.ts'), content)
    console.log('Written: src/data/categories.ts')
}

function writeCharactersIndex(results: CategoryResult[]) {
    const sorted = [...results].sort((a, b) => a.meta.slug.localeCompare(b.meta.slug))
    const exports = sorted
        .map((r) => `export { ${r.meta.exportName} } from './${r.meta.slug}'`)
        .join('\n')

    const content = `// Auto-generated by scripts/generate-characters.ts — do not edit manually\n${exports}\n`
    writeFileSync(join(OUT_DIR, 'index.ts'), content)
    console.log('Written: src/data/characters/index.ts')
}

function writeMobileImageMap(allKeys: string[]) {
    mkdirSync(MOBILE_GENERATED_DIR, { recursive: true })

    const requireLines = allKeys
        .map((key) => {
            const keyStr = serializeString(key)
            return `map[${keyStr}] = require('../../../packages/shared/assets/images/${key}')`
        })
        .join('\n')

    const content = `// Auto-generated by generate-characters.ts — do not edit manually
/* eslint-disable */
const map: Record<string, number> = {}

${requireLines}

export default map
`

    writeFileSync(join(MOBILE_GENERATED_DIR, 'image-map.ts'), content)
    console.log(`Written: apps/mobile/generated/image-map.ts (${allKeys.length} entries)`)
}

// ━━━ MAIN ━━━

async function main() {
    const tmdbApiKey = process.env.TMDB_API_KEY
    if (!tmdbApiKey) throw new Error('TMDB_API_KEY env variable is required')
    const footballApiKey = process.env.FOOTBALL_DATA_API_KEY
    if (!footballApiKey) throw new Error('FOOTBALL_DATA_API_KEY env variable is required')

    console.log('Fetching character data...\n')

    const parallelResults = await Promise.all([
        fetchCategory('LoL', () => fetchLol()),
        fetchCategory('Dota 2', () => fetchDota2()),
        fetchCategory('Valorant', () => fetchValorant()),
        fetchCategory('Flags', () => fetchFlags()),
        fetchCategory('Pokémon', () => fetchPokemon()),
        fetchCategory('Genshin', () => fetchGenshin()),
        fetchCategory('Rick & Morty', () => fetchRickAndMorty()),
        fetchCategory('Overwatch', () => fetchOverwatch()),
        fetchCategory('Dragon Ball', () => fetchDragonBall()),
        fetchCategory('Naruto', () => fetchNaruto()),
        fetchCategory('Movies', () => fetchMovies(tmdbApiKey)),
        fetchCategory('TV Shows', () => fetchTvShows(tmdbApiKey)),
        fetchCategory('People', () => fetchPeople(tmdbApiKey)),
        fetchCategory('Brands', () => fetchBrands()),
        fetchCategory('Football', () => fetchFootball(footballApiKey)),
        fetchCategory('Anime Series', () => fetchAnimeSeries(tmdbApiKey)),
        fetchCategory('Harry Potter', () => fetchHarryPotter()),
    ])

    const jikanResults: (CategoryResult | null)[] = []
    const jikanFetchers: [string, () => Promise<CategoryResult>][] = [
        ['One Piece', fetchOnePiece],
        ['Attack on Titan', fetchAttackOnTitan],
        ['Demon Slayer', fetchDemonSlayer],
        ['Jujutsu Kaisen', fetchJujutsuKaisen],
        ['My Hero Academia', fetchMyHeroAcademia],
        ['Death Note', fetchDeathNote],
        ['FMA Brotherhood', fetchFullmetalAlchemist],
        ['Hunter x Hunter', fetchHunterXHunter],
    ]
    for (const [label, fetcher] of jikanFetchers) {
        jikanResults.push(await fetchCategory(label, fetcher))
        await new Promise((r) => setTimeout(r, 1000))
    }

    const allResults = [...parallelResults, ...jikanResults].filter(
        (r): r is CategoryResult => r !== null,
    )

    if (allResults.length === 0) {
        throw new Error('All fetchers failed — check your network and API keys')
    }

    console.log(`\n${allResults.length} categories fetched successfully`)

    // ━━━ PREPARE IMAGE DOWNLOADS ━━━
    console.log('\nPreparing image downloads...')

    if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true })
    mkdirSync(OUT_DIR, { recursive: true })
    if (existsSync(IMAGES_DIR)) rmSync(IMAGES_DIR, { recursive: true })
    mkdirSync(IMAGES_DIR, { recursive: true })

    const downloadTasks: DownloadTask[] = []
    const characterLocalKeys = new Map<CategoryResult, Map<CharacterEntry, string>>()

    for (const result of allResults) {
        const dir = join(IMAGES_DIR, result.meta.slug)
        mkdirSync(dir, { recursive: true })

        const usedNames = new Map<string, number>()
        const keyMap = new Map<CharacterEntry, string>()

        for (const char of result.characters) {
            let fileName = toFileName(char.name)
            const count = usedNames.get(fileName) ?? 0
            if (count > 0) fileName = `${fileName}-${count}`
            usedNames.set(toFileName(char.name), count + 1)

            const localKey = `${result.meta.slug}/${fileName}.webp`
            keyMap.set(char, localKey)

            downloadTasks.push({
                url: char.remoteUrl,
                outPath: join(IMAGES_DIR, localKey),
                localKey,
            })
        }

        characterLocalKeys.set(result, keyMap)
    }

    // Category icons
    const categoriesDir = join(IMAGES_DIR, 'categories')
    mkdirSync(categoriesDir, { recursive: true })

    for (const result of allResults) {
        const iconKey = `categories/${result.meta.slug}.webp`
        downloadTasks.push({
            url: result.meta.iconUrl,
            outPath: join(IMAGES_DIR, iconKey),
            localKey: iconKey,
        })
    }

    // ━━━ DOWNLOAD + OPTIMIZE ━━━
    console.log(`\nDownloading and optimizing ${downloadTasks.length} images...`)
    const failed = await downloadAll(downloadTasks)

    // ━━━ WRITE CHARACTER DATA FILES ━━━
    console.log('\nWriting data files...')

    const allImageKeys: string[] = []

    for (const result of allResults) {
        const keyMap = characterLocalKeys.get(result)!
        const chars = result.characters
            .filter((c) => !failed.has(keyMap.get(c)!))
            .map((c) => ({
                name: c.name,
                localKey: keyMap.get(c)!,
            }))

        for (const c of chars) allImageKeys.push(c.localKey)

        const content = serializeCharacters(result.meta.exportName, chars)
        writeFileSync(join(OUT_DIR, `${result.meta.slug}.ts`), content)
    }

    // Add category icon keys
    for (const result of allResults) {
        const iconKey = `categories/${result.meta.slug}.webp`
        if (!failed.has(iconKey)) allImageKeys.push(iconKey)
    }

    // ━━━ WRITE CHARACTERS INDEX ━━━
    writeCharactersIndex(allResults)

    // ━━━ WRITE CATEGORIES FILE ━━━
    writeCategoriesFile(allResults)

    // ━━━ GENERATE MOBILE IMAGE MAP ━━━
    allImageKeys.sort()
    writeMobileImageMap(allImageKeys)

    console.log('\nDone!')
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
