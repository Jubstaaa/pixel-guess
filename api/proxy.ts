import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    const { url } = req.query

    if (!url || typeof url !== 'string') {
        return res.status(400).send('URL missing or invalid')
    }

    try {
        const decodedUrl = decodeURIComponent(url)
        const targetOrigin = new URL(decodedUrl).origin
        const response = await fetch(decodedUrl, {
            headers: {
                Referer: targetOrigin,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
        })

        if (!response.ok) {
            return res
                .status(response.status)
                .send(`Target error: ${response.statusText}`)
        }

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.startsWith('image/')) {
            return res.status(502).send('Non-image response from target')
        }

        const arrayBuffer = await response.arrayBuffer()

        res.setHeader('Content-Type', contentType)
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=86400, stale-while-revalidate=3600'
        )

        return res.status(200).send(Buffer.from(arrayBuffer))
    } catch (err) {
        return res.status(500).send('Proxy internal error')
    }
}
