import type { CategoryResult } from './sources/category'

export interface CategoryOutcome {
    label: string
    result: CategoryResult | null
}

// The generator rewrites src/data from scratch, so a category missing or empty
// here would silently disappear from both apps. Any failure aborts the run before
// anything on disk is touched.
export function requireAllCategories(
    outcomes: CategoryOutcome[]
): CategoryResult[] {
    const failed = outcomes.flatMap(({ label, result }) => {
        if (result === null) return [label]
        if (result.characters.length === 0) return [`${label}: no characters`]
        return []
    })

    if (failed.length > 0) {
        throw new Error(
            `${failed.length} of ${outcomes.length} categories failed (${failed.join(', ')}); existing data left untouched`
        )
    }

    return outcomes.flatMap((o) => (o.result ? [o.result] : []))
}
