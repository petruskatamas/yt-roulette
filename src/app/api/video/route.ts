import { bad } from '@/server/game'
import { collect, fetchInitialData } from '@/server/yt'
import type { YtVideoDetails } from '@/types'

export const dynamic = 'force-dynamic'

type ButtonViewModel = { iconName?: string; title?: string }
type PrimaryInfo = { dateText?: { simpleText?: string } }
type ItemSection = { sectionIdentifier?: string; contents?: Record<string, unknown>[] }

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get('id') ?? ''
  if (!/^[\w-]{11}$/.test(id)) return bad(400, 'bad video id')

  const data = await fetchInitialData(`https://www.youtube.com/watch?v=${id}`)
  if (!data) return Response.json({ error: 'fetch-failed' }, { status: 502 })

  const likeTitle =
    collect<ButtonViewModel>(data, 'buttonViewModel').find((b) => b.iconName === 'LIKE')?.title ??
    ''

  const dateText = collect<PrimaryInfo>(data, 'videoPrimaryInfoRenderer')[0]?.dateText?.simpleText

  // comments are loaded lazily; only the disabled state ships with the page.
  // structural check (language-independent): a message instead of a continuation.
  const commentSection = collect<ItemSection>(data, 'itemSectionRenderer').find(
    (s) => s.sectionIdentifier === 'comment-item-section',
  )
  const commentsDisabled = !!commentSection?.contents?.some((c) => 'messageRenderer' in c)

  const details: YtVideoDetails = {
    // a non-numeric title means the count is hidden (the button just says "Tetszik")
    likes: /\d/.test(likeTitle) ? likeTitle : '',
    commentsDisabled,
    uploaded: (dateText ?? '').replace(/^[^:]+:\s*/, ''),
    description: (
      collect<{ content?: string }>(data, 'attributedDescription')[0]?.content ?? ''
    ).slice(0, 600),
  }
  return Response.json({ details })
}
