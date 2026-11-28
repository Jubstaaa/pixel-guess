import { byName, type CategoryResult } from './category'

const LOGO_DEV_TOKEN = 'pk_eQWznTEVSQWtTwGzi_p5Qg'

const BRANDS = [
    { domain: 'apple.com', name: 'Apple' },
    { domain: 'google.com', name: 'Google' },
    { domain: 'microsoft.com', name: 'Microsoft' },
    { domain: 'amazon.com', name: 'Amazon' },
    { domain: 'meta.com', name: 'Meta' },
    { domain: 'netflix.com', name: 'Netflix' },
    { domain: 'spotify.com', name: 'Spotify' },
    { domain: 'youtube.com', name: 'YouTube' },
    { domain: 'instagram.com', name: 'Instagram' },
    { domain: 'twitter.com', name: 'Twitter' },
    { domain: 'tiktok.com', name: 'TikTok' },
    { domain: 'snapchat.com', name: 'Snapchat' },
    { domain: 'whatsapp.com', name: 'WhatsApp' },
    { domain: 'linkedin.com', name: 'LinkedIn' },
    { domain: 'reddit.com', name: 'Reddit' },
    { domain: 'twitch.tv', name: 'Twitch' },
    { domain: 'discord.com', name: 'Discord' },
    { domain: 'tesla.com', name: 'Tesla' },
    { domain: 'nike.com', name: 'Nike' },
    { domain: 'adidas.com', name: 'Adidas' },
    { domain: 'puma.com', name: 'Puma' },
    { domain: 'coca-cola.com', name: 'Coca-Cola' },
    { domain: 'pepsi.com', name: 'Pepsi' },
    { domain: 'mcdonalds.com', name: "McDonald's" },
    { domain: 'starbucks.com', name: 'Starbucks' },
    { domain: 'kfc.com', name: 'KFC' },
    { domain: 'burgerking.com', name: 'Burger King' },
    { domain: 'subway.com', name: 'Subway' },
    { domain: 'dominos.com', name: "Domino's" },
    { domain: 'disney.com', name: 'Disney' },
    { domain: 'marvel.com', name: 'Marvel' },
    { domain: 'nintendo.com', name: 'Nintendo' },
    { domain: 'playstation.com', name: 'PlayStation' },
    { domain: 'xbox.com', name: 'Xbox' },
    { domain: 'steampowered.com', name: 'Steam' },
    { domain: 'epicgames.com', name: 'Epic Games' },
    { domain: 'ea.com', name: 'EA Sports' },
    { domain: 'ubisoft.com', name: 'Ubisoft' },
    { domain: 'bmw.com', name: 'BMW' },
    { domain: 'mercedes-benz.com', name: 'Mercedes-Benz' },
    { domain: 'audi.com', name: 'Audi' },
    { domain: 'vw.com', name: 'Volkswagen' },
    { domain: 'toyota.com', name: 'Toyota' },
    { domain: 'ferrari.com', name: 'Ferrari' },
    { domain: 'lamborghini.com', name: 'Lamborghini' },
    { domain: 'porsche.com', name: 'Porsche' },
    { domain: 'ford.com', name: 'Ford' },
    { domain: 'samsung.com', name: 'Samsung' },
    { domain: 'sony.com', name: 'Sony' },
    { domain: 'lg.com', name: 'LG' },
    { domain: 'intel.com', name: 'Intel' },
    { domain: 'nvidia.com', name: 'Nvidia' },
    { domain: 'amd.com', name: 'AMD' },
    { domain: 'visa.com', name: 'Visa' },
    { domain: 'mastercard.com', name: 'Mastercard' },
    { domain: 'paypal.com', name: 'PayPal' },
    { domain: 'airbnb.com', name: 'Airbnb' },
    { domain: 'uber.com', name: 'Uber' },
    { domain: 'shopify.com', name: 'Shopify' },
]

export function fetchBrands(): Promise<CategoryResult> {
    const characters = BRANDS.map(({ domain, name }) => ({
        name,
        remoteUrl: logoUrl(domain, { format: 'png', theme: 'dark' }),
    })).sort(byName)

    console.log(`Brands: ${characters.length} brands`)
    return Promise.resolve({
        characters,
        meta: {
            exportName: 'brandCharacters',
            iconUrl: logoUrl('google.com', { format: 'png' }),
            imageType: 'logo',
            name: 'Brands',
            slug: 'brands',
        },
    })
}

function logoUrl(domain: string, params: Record<string, string>): string {
    const url = new URL(`https://img.logo.dev/${domain}`)
    url.search = new URLSearchParams({
        token: LOGO_DEV_TOKEN,
        ...params,
    }).toString()
    return url.toString()
}
