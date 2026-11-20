// Hand-rolled rather than a slug library: these slugs are the CDN object keys
// published app versions request, and any library would rename some of them.
export function toFileName(name: string): string {
    return (
        name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'unnamed'
    )
}
