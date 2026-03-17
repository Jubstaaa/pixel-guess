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
        const response = await fetch(decodedUrl)

        if (!response.ok) {
            return res
                .status(response.status)
                .send(`Target error: ${response.statusText}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const contentType = response.headers.get('content-type')

        res.setHeader('Content-Type', contentType || 'image/jpeg')
        res.setHeader(
            'Cache-Control',
            'public, s-maxage=86400, stale-while-revalidate=3600'
        )

        return res.status(200).send(Buffer.from(arrayBuffer))
    } catch (err) {
        return res.status(500).send('Proxy internal error')
    }
}
