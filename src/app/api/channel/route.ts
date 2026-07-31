import { bad } from '@/server/game'
import { collect, fetchInitialData, parseCount } from '@/server/yt'
import type { YtChannel } from '@/types'

export const dynamic = 'force-dynamic'

type ContentMetadata = {
  metadataRows?: { metadataParts?: { text?: { content?: string } }[] }[]
}
type ChannelMetadata = {
  title?: string
  description?: string
  avatar?: { thumbnails?: { url: string }[] }
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? ''
  if (!/^UC[\w-]{20,}$/.test(id)) return bad(400, 'bad channel id')

  const data = await fetchInitialData(`https://www.youtube.com/channel/${id}`)
  if (!data) return Response.json({ error: 'fetch-failed' }, { status: 502 })

  const meta = collect<ChannelMetadata>(data, 'channelMetadataRenderer')[0] ?? {}
  const parts = collect<ContentMetadata>(data, 'contentMetadataViewModel')
    .flatMap((m) => m.metadataRows ?? [])
    .flatMap((row) => row.metadataParts ?? [])
    .map((p) => p.text?.content ?? '')
    .filter(Boolean)

  const subs = parseCount(parts.find((p) => /subscriber/i.test(p)) ?? '')
  const videos = parseCount(parts.find((p) => /\bvideo/i.test(p)) ?? '')
  const thumbs = meta.avatar?.thumbnails ?? []

  const channel: YtChannel = {
    id,
    name: meta.title ?? '',
    avatar: thumbs[thumbs.length - 1]?.url ?? '',
    subscribers: subs.value,
    subscribersText: subs.text,
    subscribersApprox: subs.approx,
    videoCount: videos.value,
    description: (meta.description ?? '').slice(0, 400),
  }
  return Response.json({ channel })
}
