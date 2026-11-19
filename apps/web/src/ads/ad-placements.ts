import type { AdPlacement } from './ad-slot'

// Ad unit ids from AdSense > Ads > By ad unit > Display ads. Every unit is a
// fixed size, so the reserved box matches what is served. A null slot renders
// nothing. One unit id may back several ads on a page.
export const adPlacements = {
    // web-game-mobile-banner: below the guess input, under the desktop breakpoint.
    gameMobile: { size: 'mobileBanner', slot: '4923114953' },
    // web-game-sidebar: one in each gutter beside the game on wide screens.
    gameSidebar: { size: 'wideSkyscraper', slot: '6100465255' },
    // web-home-categories: a full grid row between the categories.
    homeInList: { size: 'mediumRectangle', slot: '9085721246' },
} as const satisfies Record<string, AdPlacement>
