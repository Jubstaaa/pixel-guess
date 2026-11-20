import { describe, expect, test } from 'bun:test'

import { jikanCharactersSchema, toJikanCharacters } from './jikan'

const payload = jikanCharactersSchema.parse({
    data: [
        {
            character: {
                mal_id: 40,
                name: 'Monkey D., Luffy',
                images: { jpg: { image_url: 'https://cdn/luffy.jpg' } },
            },
            role: 'Main',
            favorites: 100,
        },
        {
            character: {
                name: 'Zoro',
                images: { jpg: { image_url: 'https://cdn/zoro.jpg' } },
            },
            favorites: 90,
        },
        {
            character: {
                name: 'No Image',
                images: { jpg: { image_url: null } },
            },
            favorites: 500,
        },
        {
            character: {
                name: 'Unpopular',
                images: { jpg: { image_url: 'https://cdn/u.jpg' } },
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
