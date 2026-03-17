import { Link } from 'react-router'

import type { Category } from '@pixel-guess/shared'

const PROXY_BASE = import.meta.env.DEV ? 'http://localhost:3000/api/proxy' : '/api/proxy'

function proxyIcon(url: string) {
    const hotlinkProtected = ['logos-world.net', 'wikia.nocookie.net']
    if (hotlinkProtected.some((h) => url.includes(h))) {
        return `${PROXY_BASE}?url=${encodeURIComponent(url)}`
    }
    return url
}

interface CategoryCardProps {
    item: Category
}

export const CategoryCard = ({ item }: CategoryCardProps) => (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <div className="flex items-center gap-4 px-4 py-4">
            <div className="rounded-xl bg-primary/10 p-3">
                <img
                    alt={item.name}
                    className="h-11 w-11 rounded-lg object-contain"
                    src={proxyIcon(item.icon)}
                />
            </div>
            <div className="flex flex-1 flex-col gap-2.5">
                <span className="text-[17px] font-bold text-foreground">
                    {item.name}
                </span>
                <div className="flex gap-2">
                    <Link
                        className="rounded-lg border border-success/25 bg-success/10 px-4 py-1.5 text-[12px] font-semibold text-success transition-opacity hover:opacity-80"
                        to={`/${item.slug}/easy`}
                    >
                        Easy
                    </Link>
                    <Link
                        className="rounded-lg border border-warning/25 bg-warning/10 px-4 py-1.5 text-[12px] font-semibold text-warning transition-opacity hover:opacity-80"
                        to={`/${item.slug}/hard`}
                    >
                        Hard
                    </Link>
                </div>
            </div>
            <span className="text-[13px] text-muted">
                {item.characterCount}
            </span>
        </div>
    </div>
)
