import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

    if (req.method === 'OPTIONS') return res.status(200).end()

    const { url } = req.query
    if (!url || typeof url !== 'string') return res.status(400).send('URL missing')

    try {
        const decodedUrl = decodeURIComponent(url)
        const targetUrl = new URL(decodedUrl)

        const response = await fetch(decodedUrl, {
            headers: {
                Referer: targetUrl.origin,
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
        })

        if (!response.ok) return res.status(response.status).send('Target error')

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) {
            return res.status(502).send('Non-image response from target')
        }

        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=3600')

        if (!response.body) return res.status(500).send('No body')

        const reader = response.body.getReader()
        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            res.write(value)
        }

        return res.end()
    } catch (err) {
        console.error(err)
        return res.status(500).send('Proxy error')
    }
}
