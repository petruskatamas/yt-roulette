import { bad } from '@/server/game'
import { collect, fetchInitialData } from '@/server/yt'
import type { YtChannel } from '@/types'

export const dynamic = 'force-dynamic'

type ContentMetadata = {
  metadataRows?: { metadataParts?: { text?: { content?: string } }[] }[]
}
type ChannelMetadata = {
  title?: string
  description?: string
  externalId?: string
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

  const thumbs = meta.avatar?.thumbnails ?? []
  const channel: YtChannel = {
    id,
    name: meta.title ?? '',
    avatar: thumbs[thumbs.length - 1]?.url ?? '',
    subscribers: parts.find((p) => /feliratkoz|subscrib/i.test(p)) ?? '',
    videoCount: parts.find((p) => /videó|video/i.test(p)) ?? '',
    description: (meta.description ?? '').slice(0, 400),
  }
  return Response.json({ channel })
}
