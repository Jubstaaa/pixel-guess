import { byName, type CategoryResult } from './category'

// logo.dev publishable key: it is meant to ship in client-side image URLs.
const LOGO_DEV_TOKEN = 'pk_eQWznTEVSQWtTwGzi_p5Qg'

const BRANDS = [
    { name: 'Apple', domain: 'apple.com' },
    { name: 'Google', domain: 'google.com' },
    { name: 'Microsoft', domain: 'microsoft.com' },
    { name: 'Amazon', domain: 'amazon.com' },
    { name: 'Meta', domain: 'meta.com' },
    { name: 'Netflix', domain: 'netflix.com' },
    { name: 'Spotify', domain: 'spotify.com' },
    { name: 'YouTube', domain: 'youtube.com' },
    { name: 'Instagram', domain: 'instagram.com' },
    { name: 'Twitter', domain: 'twitter.com' },
    { name: 'TikTok', domain: 'tiktok.com' },
    { name: 'Snapchat', domain: 'snapchat.com' },
    { name: 'WhatsApp', domain: 'whatsapp.com' },
    { name: 'LinkedIn', domain: 'linkedin.com' },
    { name: 'Reddit', domain: 'reddit.com' },
    { name: 'Twitch', domain: 'twitch.tv' },
    { name: 'Discord', domain: 'discord.com' },
    { name: 'Tesla', domain: 'tesla.com' },
    { name: 'Nike', domain: 'nike.com' },
    { name: 'Adidas', domain: 'adidas.com' },
    { name: 'Puma', domain: 'puma.com' },
    { name: 'Coca-Cola', domain: 'coca-cola.com' },
    { name: 'Pepsi', domain: 'pepsi.com' },
    { name: "McDonald's", domain: 'mcdonalds.com' },
    { name: 'Starbucks', domain: 'starbucks.com' },
    { name: 'KFC', domain: 'kfc.com' },
    { name: 'Burger King', domain: 'burgerking.com' },
    { name: 'Subway', domain: 'subway.com' },
    { name: "Domino's", domain: 'dominos.com' },
    { name: 'Disney', domain: 'disney.com' },
    { name: 'Marvel', domain: 'marvel.com' },
    { name: 'Nintendo', domain: 'nintendo.com' },
    { name: 'PlayStation', domain: 'playstation.com' },
    { name: 'Xbox', domain: 'xbox.com' },
    { name: 'Steam', domain: 'steampowered.com' },
    { name: 'Epic Games', domain: 'epicgames.com' },
    { name: 'EA Sports', domain: 'ea.com' },
    { name: 'Ubisoft', domain: 'ubisoft.com' },
    { name: 'BMW', domain: 'bmw.com' },
    { name: 'Mercedes-Benz', domain: 'mercedes-benz.com' },
    { name: 'Audi', domain: 'audi.com' },
    { name: 'Volkswagen', domain: 'vw.com' },
    { name: 'Toyota', domain: 'toyota.com' },
    { name: 'Ferrari', domain: 'ferrari.com' },
    { name: 'Lamborghini', domain: 'lamborghini.com' },
    { name: 'Porsche', domain: 'porsche.com' },
    { name: 'Ford', domain: 'ford.com' },
    { name: 'Samsung', domain: 'samsung.com' },
    { name: 'Sony', domain: 'sony.com' },
    { name: 'LG', domain: 'lg.com' },
    { name: 'Intel', domain: 'intel.com' },
    { name: 'Nvidia', domain: 'nvidia.com' },
    { name: 'AMD', domain: 'amd.com' },
    { name: 'Visa', domain: 'visa.com' },
    { name: 'Mastercard', domain: 'mastercard.com' },
    { name: 'PayPal', domain: 'paypal.com' },
    { name: 'Airbnb', domain: 'airbnb.com' },
    { name: 'Uber', domain: 'uber.com' },
    { name: 'Shopify', domain: 'shopify.com' },
]

function logoUrl(domain: string, params: Record<string, string>): string {
    const url = new URL(`https://img.logo.dev/${domain}`)
    url.search = new URLSearchParams({
        token: LOGO_DEV_TOKEN,
        ...params,
    }).toString()
    return url.toString()
}

export async function fetchBrands(): Promise<CategoryResult> {
    const characters = BRANDS.map(({ name, domain }) => ({
        name,
        remoteUrl: logoUrl(domain, { format: 'png', theme: 'dark' }),
    })).sort(byName)

    console.log(`Brands: ${characters.length} brands`)
    return {
        meta: {
            slug: 'brands',
            name: 'Brands',
            exportName: 'brandCharacters',
            imageType: 'logo',
            iconUrl: logoUrl('google.com', { format: 'png' }),
        },
        characters,
    }
}
