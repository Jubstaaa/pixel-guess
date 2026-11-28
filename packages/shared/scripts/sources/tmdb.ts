import { z } from 'zod'

import { byName, type CategoryResult, type CharacterEntry } from './category'
import { fetchJson } from './fetch-json'

const TMDB_API = 'https://api.themoviedb.org/3/'
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const POPULAR_FIRST = { sort_by: 'popularity.desc' }
const ENGLISH = { language: 'en-US' }

const imagePath = z.string().nullish()

export const tmdbMovieSchema = z.object({
    poster_path: imagePath,
    title: z.string(),
})
export const tmdbShowSchema = z.object({
    name: z.string(),
    poster_path: imagePath,
})
const tmdbPersonSchema = z.object({
    name: z.string(),
    profile_path: imagePath,
})

interface TmdbImage {
    name: string
    path: null | string | undefined
}

export async function fetchAnimeSeries(
    apiKey: string
): Promise<CategoryResult> {
    const shows = await fetchTmdbPages(
        'discover/tv',
        apiKey,
        4,
        { ...POPULAR_FIRST, with_genres: '16', with_original_language: 'ja' },
        tmdbShowSchema
    )
    const characters = toTmdbCharacters(
        shows.map(s => ({ name: s.name, path: s.poster_path })),
        80
    )

    console.log(`Anime Series: ${characters.length} anime`)
    return {
        characters,
        meta: {
            exportName: 'animeSeriesCharacters',
            iconUrl:
                'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2021/04/Crunchyroll-Logo.png',
            imageType: 'poster',
            name: 'Anime Series',
            slug: 'anime-series',
        },
    }
}

export async function fetchMovies(apiKey: string): Promise<CategoryResult> {
    const movies = await fetchTmdbPages(
        'discover/movie',
        apiKey,
        5,
        {
            ...ENGLISH,
            ...POPULAR_FIRST,
            'vote_count.gte': '1000',
            'with_original_language': 'en',
        },
        tmdbMovieSchema
    )
    const characters = toTmdbCharacters(
        movies.map(m => ({ name: m.title, path: m.poster_path }))
    )

    console.log(`Movies: ${characters.length} movies`)
    return {
        characters,
        meta: {
            exportName: 'movieCharacters',
            iconUrl:
                'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png',
            imageType: 'poster',
            name: 'Movies',
            slug: 'movies',
        },
    }
}

export async function fetchPeople(apiKey: string): Promise<CategoryResult> {
    const people = await fetchTmdbPages(
        'person/popular',
        apiKey,
        3,
        ENGLISH,
        tmdbPersonSchema
    )
    const characters = toTmdbCharacters(
        people.map(p => ({ name: p.name, path: p.profile_path })),
        50
    )

    console.log(`People: ${characters.length} people`)
    return {
        characters,
        meta: {
            exportName: 'peopleCharacters',
            iconUrl:
                'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Tmdb.new.logo.svg/400px-Tmdb.new.logo.svg.png',
            imageType: 'poster',
            name: 'People',
            slug: 'people',
        },
    }
}

export async function fetchTvShows(apiKey: string): Promise<CategoryResult> {
    const shows = await fetchTmdbPages(
        'discover/tv',
        apiKey,
        5,
        {
            ...ENGLISH,
            ...POPULAR_FIRST,
            'vote_count.gte': '500',
            'with_original_language': 'en',
        },
        tmdbShowSchema
    )
    const characters = toTmdbCharacters(
        shows.map(s => ({ name: s.name, path: s.poster_path }))
    )

    console.log(`TV Shows: ${characters.length} shows`)
    return {
        characters,
        meta: {
            exportName: 'tvShowCharacters',
            iconUrl:
                'https://images.weserv.nl/?url=logos-world.net/wp-content/uploads/2020/04/Netflix-Logo.png',
            imageType: 'poster',
            name: 'TV Shows',
            slug: 'tv-shows',
        },
    }
}

export function tmdbPageSchema<Item extends z.ZodType>(item: Item) {
    return z.object({ results: z.array(item) })
}

export function tmdbPageUrl(
    endpoint: string,
    apiKey: string,
    page: number,
    params: Record<string, string>
): URL {
    const url = new URL(endpoint, TMDB_API)
    url.search = new URLSearchParams({
        api_key: apiKey,
        page: String(page),
        ...params,
    }).toString()
    return url
}

async function fetchTmdbPages<Item extends z.ZodType>(
    endpoint: string,
    apiKey: string,
    pages: number,
    params: Record<string, string>,
    item: Item
): Promise<z.output<Item>[]> {
    const schema = tmdbPageSchema(item)
    const responses = await Promise.all(
        Array.from({ length: pages }, (_, i) =>
            fetchJson(tmdbPageUrl(endpoint, apiKey, i + 1, params), schema)
        )
    )

    return responses.flatMap(r => r.results)
}

function toTmdbCharacters(
    items: TmdbImage[],
    limit = Infinity
): CharacterEntry[] {
    return items
        .flatMap(({ name, path }) => (path ? [{ name, path }] : []))
        .slice(0, limit)
        .map(({ name, path }) => ({
            name,
            remoteUrl: `${TMDB_IMAGE_BASE}${path}`,
        }))
        .sort(byName)
}
