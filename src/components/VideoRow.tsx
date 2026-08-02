import { fmtRelative, fmtViews } from '@/lib/i18n'
import type { Messages } from '@/lib/i18n'
import type { YtResult } from '@/types'

type Props = {
  video: YtResult
  t: Messages
  onPick: (video: YtResult) => void
  compact?: boolean
  index?: number
  highlighted?: boolean
  picked?: boolean
}

export function VideoRow({ video, t, onPick, compact, index, highlighted, picked }: Props) {
  return (
    <button
      data-row={index}
      className={[
        'yt-row',
        compact ? 'is-compact' : '',
        highlighted ? 'is-highlighted' : '',
        picked ? 'is-picked' : '',
      ].join(' ')}
      onClick={() => onPick(video)}
    >
      <span className="yt-thumb">
        <img src={video.thumb} alt="" loading="lazy" />
        {video.duration && <span className="yt-duration">{video.duration}</span>}
      </span>
      <span className="yt-info">
        <span className="yt-title">{video.title}</span>
        {compact ? (
          <>
            <span className="yt-meta">{video.channel}</span>
            <span className={`yt-meta ${video.views === 0 ? 'zero-views' : ''}`}>
              {fmtViews(video.views, t)}
              {video.published && ` · ${fmtRelative(video.published, t)}`}
            </span>
          </>
        ) : (
          <>
            <span className={`yt-stats ${video.views === 0 ? 'zero-views' : ''}`}>
              {fmtViews(video.views, t)}
              {video.published && (
                <span className="yt-meta"> · {fmtRelative(video.published, t)}</span>
              )}
            </span>
            <span className="yt-meta">{video.channel}</span>
          </>
        )}
      </span>
    </button>
  )
}
