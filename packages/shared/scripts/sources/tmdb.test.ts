import { describe, expect, test } from 'bun:test'

import {
    tmdbMovieSchema,
    tmdbPageSchema,
    tmdbPageUrl,
    tmdbShowSchema,
} from './tmdb'

describe('tmdbPageUrl', () => {
    test('builds the endpoint URL with key, page and extra parameters', () => {
        const url = tmdbPageUrl('discover/movie', 'key', 2, {
            'vote_count.gte': '1000',
            'with_original_language': 'en',
        })

        expect(url.origin + url.pathname).toBe(
            'https://api.themoviedb.org/3/discover/movie'
        )
        expect(Object.fromEntries(url.searchParams)).toEqual({
            'api_key': 'key',
            'page': '2',
            'vote_count.gte': '1000',
            'with_original_language': 'en',
        })
    })
})

describe('tmdbPageSchema', () => {
    test('parses a discover page and keeps missing posters as null', () => {
        const page = tmdbPageSchema(tmdbMovieSchema).parse({
            page: 1,
            results: [
                { id: 1, poster_path: '/a.jpg', title: 'Inception' },
                { id: 2, poster_path: null, title: 'No Poster' },
            ],
        })

        expect(page.results).toEqual([
            { poster_path: '/a.jpg', title: 'Inception' },
            { poster_path: null, title: 'No Poster' },
        ])
    })

    test('rejects a page whose items lack the name field', () => {
        expect(() =>
            tmdbPageSchema(tmdbShowSchema).parse({
                results: [
                    { poster_path: '/a.jpg', title: 'Movie, not a show' },
                ],
            })
        ).toThrow()
    })
})
