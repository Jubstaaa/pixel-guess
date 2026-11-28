import { describe, expect, test } from 'bun:test'

import { jikanCharactersSchema, toJikanCharacters } from './jikan'

const payload = jikanCharactersSchema.parse({
    data: [
        {
            character: {
                images: { jpg: { image_url: 'https://cdn/luffy.jpg' } },
                mal_id: 40,
                name: 'Monkey D., Luffy',
            },
            favorites: 100,
            role: 'Main',
        },
        {
            character: {
                images: { jpg: { image_url: 'https://cdn/zoro.jpg' } },
                name: 'Zoro',
            },
            favorites: 90,
        },
        {
            character: {
                images: { jpg: { image_url: null } },
                name: 'No Image',
            },
            favorites: 500,
        },
        {
            character: {
                images: { jpg: { image_url: 'https://cdn/u.jpg' } },
                name: 'Unpopular',
            },
            favorites: 1,
        },
    ],
})

describe('toJikanCharacters', () => {
    test('keeps the most favourited characters with images, sorted by name', () => {
        expect(toJikanCharacters(payload, 2)).toEqual([
            { name: 'Luffy Monkey D.', remoteUrl: 'https://cdn/luffy.jpg' },
            { name: 'Zoro', remoteUrl: 'https://cdn/zoro.jpg' },
        ])
    })
})
