// Ad unit ids from AdSense > Ads > By ad unit > Display ads (web-game-below,
// web-home-categories). A null placement renders nothing.
// Both units are fixed 300x250 so the reserved box matches what is served.
export const adSlots: Record<'game' | 'home', string | null> = {
    game: '1558585018',
    home: '9085721246',
}
