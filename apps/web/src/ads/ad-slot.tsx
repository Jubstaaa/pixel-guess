import { Adsense } from '@ctrl/react-adsense'
import { useInView } from 'react-intersection-observer'
import { useLocation } from 'react-router'

import { useFirstInteraction } from './use-first-interaction'

const AD_CLIENT = 'ca-pub-5250650495212334'
const AD_SCRIPT = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`

// The standard fixed sizes of the units in ad-placements.ts. The classes are
// spelled out so Tailwind finds them.
const adSizes = {
    mediumRectangle: { box: 'w-75 h-62.5', height: 250, width: 300 },
    mobileBanner: { box: 'w-80 h-12.5', height: 50, width: 320 },
    wideSkyscraper: { box: 'w-40 h-150', height: 600, width: 160 },
}

export type AdSize = keyof typeof adSizes

export interface AdPlacement {
    size: AdSize
    slot: string | null
}

interface AdSlotProps {
    className?: string
    placement: AdPlacement
}

// The AdSense script and the ad request wait for the visitor's first
// interaction and for the slot to be near the screen, so neither competes
// with the game for the first load.
export const AdSlot = ({
    className = '',
    placement: { size, slot },
}: AdSlotProps) => {
    const { pathname } = useLocation()

    if (!slot) return null

    return (
        <aside
            aria-label="Advertisement"
            className={`flex flex-col items-center gap-1 ${className}`}
        >
            <span className="text-[11px] uppercase tracking-wide text-muted">
                Advertisement
            </span>
            {/* A new page of the single-page app gets a new ad unit. */}
            <AdBox key={pathname} size={size} slot={slot} />
        </aside>
    )
}

const AdBox = ({ size, slot }: { size: AdSize; slot: string }) => {
    const { box, height, width } = adSizes[size]
    const interacted = useFirstInteraction()
    const { inView, ref } = useInView({
        rootMargin: '200px',
        triggerOnce: true,
    })

    return (
        <div ref={ref} className={box} data-ad-box>
            {interacted && inView && (
                <>
                    <script async crossOrigin="anonymous" src={AD_SCRIPT} />
                    <Adsense
                        client={AD_CLIENT}
                        format=""
                        slot={slot}
                        style={{ display: 'inline-block', height, width }}
                    />
                </>
            )}
        </div>
    )
}
