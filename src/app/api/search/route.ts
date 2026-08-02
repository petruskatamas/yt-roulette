import { bad, json } from '@/server/http'
import { collect, fetchInitialData, parseCount, parseRelative } from '@/server/yt'
import type { YtResult } from '@/types'

export const dynamic = 'force-dynamic'

type Run = {
  text: string
  navigationEndpoint?: { browseEndpoint?: { browseId?: string } }
}
type VideoRenderer = {
  videoId?: string
  title?: { runs?: Run[] }
  ownerText?: { runs?: Run[] }
  publishedTimeText?: { simpleText?: string }
  viewCountText?: { simpleText?: string; runs?: Run[] }
  lengthText?: { simpleText?: string }
  thumbnail?: { thumbnails?: { url: string }[] }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') ?? ''
  const sort = url.searchParams.get('sort')
  if (!q) return bad(400, 'missing q')

  const ytUrl = new URL('https://www.youtube.com/results')
  ytUrl.searchParams.set('search_query', q)
  if (sort === 'date') ytUrl.searchParams.set('sp', 'CAI=')

  const data = await fetchInitialData(ytUrl)
  if (!data) return bad(502, 'fetch-failed')
  const renderers = collect<VideoRenderer>(data, 'videoRenderer')

  const seen = new Set<string>()
  const results: YtResult[] = []
  for (const vr of renderers) {
    const id = vr.videoId
    if (!id || seen.has(id)) continue
    seen.add(id)
    const thumbs = vr.thumbnail?.thumbnails ?? []
    const viewText =
      vr.viewCountText?.simpleText ?? vr.viewCountText?.runs?.map((r) => r.text).join('') ?? ''
    results.push({
      id,
      title: vr.title?.runs?.map((r) => r.text).join('') ?? '',
      channel: vr.ownerText?.runs?.map((r) => r.text).join('') ?? '',
      channelId: vr.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ?? '',
      published: parseRelative(vr.publishedTimeText?.simpleText ?? ''),
      thumb: thumbs[thumbs.length - 1]?.url ?? '',
      views: parseCount(viewText).value ?? -1,
      duration: vr.lengthText?.simpleText ?? '',
    })
    if (results.length >= 30) break
  }

  // the graveyard first: lowest view count on top (date searches keep newest-first)
  if (sort !== 'date') {
    results.sort((a, b) => (a.views < 0 ? 1 : b.views < 0 ? -1 : a.views - b.views))
  }

  return json({ results })
}
