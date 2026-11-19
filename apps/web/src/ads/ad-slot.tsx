import { Adsense } from '@ctrl/react-adsense'
import { useInView } from 'react-intersection-observer'
import { useLocation } from 'react-router'

import { useFirstInteraction } from './use-first-interaction'

const AD_CLIENT = 'ca-pub-5250650495212334'
const AD_SCRIPT = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CLIENT}`

interface AdSlotProps {
    className?: string
    slot: string | null
}

// The AdSense script and the ad request wait for the visitor's first
// interaction and for the slot to be near the screen, so neither competes
// with the game for the first load.
export const AdSlot = ({ className = '', slot }: AdSlotProps) => {
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
            <AdBox key={pathname} slot={slot} />
        </aside>
    )
}

const AdBox = ({ slot }: { slot: string }) => {
    const interacted = useFirstInteraction()
    const { inView, ref } = useInView({
        rootMargin: '200px',
        triggerOnce: true,
    })

    return (
        <div ref={ref} className="h-62.5 w-75" data-ad-box>
            {interacted && inView && (
                <>
                    <script async crossOrigin="anonymous" src={AD_SCRIPT} />
                    <Adsense
                        client={AD_CLIENT}
                        format=""
                        slot={slot}
                        style={{
                            display: 'inline-block',
                            height: 250,
                            width: 300,
                        }}
                    />
                </>
            )}
        </div>
    )
}
