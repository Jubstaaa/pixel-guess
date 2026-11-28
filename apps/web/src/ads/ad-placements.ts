import type { AdPlacement } from './ad-slot'

export const adPlacements = {
    gameMobile: { size: 'mobileBanner', slot: '4923114953' },

    gameSidebar: { size: 'wideSkyscraper', slot: '6100465255' },

    homeListMobile: { size: 'largeMobileBanner', slot: '1339093169' },

    homeListWide: { size: 'banner', slot: '1754026132' },
} as const satisfies Record<string, AdPlacement>
