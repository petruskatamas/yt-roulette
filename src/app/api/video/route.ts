import { bad } from '@/server/game'
import { collect, fetchInitialData, parseCount, parseDate } from '@/server/yt'
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
    collect<ButtonViewModel>(data, 'buttonViewModel').find((b) => b.iconName === 'LIKE')?.title ?? ''
  // a title without digits means the count is hidden (the button just says "Like")
  const likes = parseCount(/\d/.test(likeTitle) ? likeTitle : '')

  // comments are loaded lazily; only the disabled state ships with the page.
  // structural check (language-independent): a message instead of a continuation.
  const commentSection = collect<ItemSection>(data, 'itemSectionRenderer').find(
    (s) => s.sectionIdentifier === 'comment-item-section',
  )

  const details: YtVideoDetails = {
    likes: likes.value,
    likesText: likes.text,
    likesApprox: likes.approx,
    commentsDisabled: !!commentSection?.contents?.some((c) => 'messageRenderer' in c),
    uploaded: parseDate(
      collect<PrimaryInfo>(data, 'videoPrimaryInfoRenderer')[0]?.dateText?.simpleText ?? '',
    ),
    description: (
      collect<{ content?: string }>(data, 'attributedDescription')[0]?.content ?? ''
    ).slice(0, 600),
  }
  return Response.json({ details })
}
