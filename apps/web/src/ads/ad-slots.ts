// Ad unit ids from AdSense > Ads > By ad unit > Display ads. Each placement
// stays null, and renders nothing, until its unit exists in the dashboard.
// Both units are fixed 300x250 so the reserved box matches what is served.
export const adSlots: Record<'game' | 'home', string | null> = {
    game: null,
    home: null,
}
