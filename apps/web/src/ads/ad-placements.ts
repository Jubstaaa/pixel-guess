import type { AdPlacement } from './ad-slot'

// Ad unit ids from AdSense > Ads > By ad unit > Display ads. Every unit is a
// fixed size, so the reserved box matches what is served. A null slot renders
// nothing. One unit id may back several ads on a page.
export const adPlacements = {
    // web-game-mobile-banner: below the guess input, under the desktop breakpoint.
    gameMobile: { size: 'mobileBanner', slot: '4923114953' },
    // web-game-sidebar: one in each gutter beside the game on wide screens.
    gameSidebar: { size: 'wideSkyscraper', slot: '6100465255' },
    // web-home-list-mobile: a category-card row in the one-column list.
    homeListMobile: { size: 'largeMobileBanner', slot: '1339093169' },
    // web-home-list-wide: a full category-card row in the two-column list.
    homeListWide: { size: 'banner', slot: '1754026132' },
} as const satisfies Record<string, AdPlacement>
