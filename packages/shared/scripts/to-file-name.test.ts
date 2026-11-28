import { describe, expect, test } from 'bun:test'

import { toFileName } from './to-file-name'

describe('toFileName', () => {
    test.each([
        ["Kai'Sa", 'kai-sa'],
        ['Nunu & Willump', 'nunu-willump'],
        ['Åland Islands', 'aland-islands'],
        ["Côte d'Ivoire (Ivory Coast)", 'cote-d-ivoire-ivory-coast'],
        ['Luffy Monkey D.', 'luffy-monkey-d'],
        ['Mr mime', 'mr-mime'],
    ])('%p -> %p', (name, expected) => {
        expect(toFileName(name)).toBe(expected)
    })

    test('falls back to "unnamed" when nothing survives', () => {
        expect(toFileName('???')).toBe('unnamed')
    })
})
