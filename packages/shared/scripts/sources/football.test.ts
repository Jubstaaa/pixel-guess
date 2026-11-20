import { describe, expect, test } from 'bun:test'

import { footballTeamsSchema, toFootballCharacters } from './football'

describe('toFootballCharacters', () => {
    test('merges competitions, dropping duplicates and clubs without a crest', () => {
        const premierLeague = footballTeamsSchema.parse({
            count: 2,
            teams: [
                { id: 57, name: 'Arsenal FC', crest: 'https://crests/57.png' },
                { id: 1, name: 'No Crest FC', crest: null },
            ],
        })
        const cup = footballTeamsSchema.parse({
            teams: [
                { id: 57, name: 'Arsenal FC', crest: 'https://crests/57.png' },
                { id: 5, name: 'Bayern', crest: 'https://crests/5.png' },
            ],
        })

        expect(toFootballCharacters([premierLeague, cup])).toEqual([
            { name: 'Arsenal FC', remoteUrl: 'https://crests/57.png' },
            { name: 'Bayern', remoteUrl: 'https://crests/5.png' },
        ])
    })
})
