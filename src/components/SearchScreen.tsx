import { useEffect, useRef, useState } from 'react'
import { openOnTv } from '@/lib/gameClient'
import { fmtDate, fmtRelative, fmtViews } from '@/lib/i18n'
import type { Messages } from '@/lib/i18n'
import { useJson } from '@/lib/useJson'
import { land, wheelTicks } from '@/lib/sound'
import { ytUrl } from '@/data/patterns'
import type { Spin, YtChannel, YtResult, YtVideoDetails } from '@/types'
import { VideoRow } from '@/components/VideoRow'

const ROLL_SECONDS = 2.2

type Props = {
  spin: Spin
  t: Messages
  onClose: () => void
  onWatchChange: (video: YtResult | null) => void
}

export function SearchScreen({ spin, t, onClose, onWatchChange }: Props) {
  const [playing, setPlaying] = useState<YtResult | null>(null)
  const [rollingIndex, setRollingIndex] = useState<number | null>(null)
  const [pickedIndex, setPickedIndex] = useState<number | null>(null)
  const rollTimers = useRef<number[]>([])

  const search = useJson<{ results: YtResult[] }>(
    `/api/search?q=${encodeURIComponent(spin.query)}&sort=${spin.sort}`,
  )
  const results = search.data?.results ?? null
  const details = useJson<{ details: YtVideoDetails }>(
    playing ? `/api/video?id=${playing.id}` : null,
  ).data?.details
  const channel = useJson<{ channel: YtChannel }>(
    playing?.channelId ? `/api/channel?id=${playing.channelId}` : null,
  ).data?.channel

  useEffect(() => onWatchChange(playing), [playing, onWatchChange])
  useEffect(() => {
    const timers = rollTimers.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const randomPick = () => {
    if (!results?.length || rollingIndex !== null) return
    const target = Math.floor(Math.random() * results.length)

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlaying(results[target])
      return
    }

    // same ease-out curve as the wheel, so ticks and highlight decelerate together
    const steps = Math.min(26, Math.max(12, results.length * 2))
    wheelTicks(ROLL_SECONDS, steps)
    const timers = [...Array(steps)].map((_, k) => {
      const step = k + 1
      const at = (1 - Math.cbrt(1 - step / steps)) * ROLL_SECONDS * 1000
      const index = step === steps ? target : Math.floor(Math.random() * results.length)
      return window.setTimeout(() => {
        setRollingIndex(index)
        document.querySelector(`[data-row="${index}"]`)?.scrollIntoView({ block: 'nearest' })
      }, at)
    })
    timers.push(
      window.setTimeout(() => {
        land()
        setRollingIndex(null)
        setPickedIndex(target)
      }, ROLL_SECONDS * 1000 + 40),
      window.setTimeout(() => {
        setPickedIndex(null)
        setPlaying(results[target])
      }, ROLL_SECONDS * 1000 + 950),
    )
    rollTimers.current = timers
  }

  const likesLabel = () => {
    if (!details) return '…'
    if (details.likes == null) return t.watch.likesHidden
    return details.likesApprox ? t.watch.likesApprox(details.likesText) : t.watch.likes(details.likes)
  }

  const subscribersLabel = () => {
    if (!channel) return '…'
    if (channel.subscribers == null) return t.watch.subscribersHidden
    return channel.subscribersApprox
      ? t.watch.subscribersApprox(channel.subscribersText)
      : t.watch.subscribers(channel.subscribers)
  }

  return (
    <div className="search-screen">
      <div className="search-head">
        {playing && (
          <button className="btn" onClick={() => setPlaying(null)}>
            {t.search.results}
          </button>
        )}
        <span className="search-query">{spin.query}</span>
        {!playing && !!results?.length && (
          <button
            className={`btn btn-primary roll-btn ${rollingIndex !== null ? 'is-rolling' : ''}`}
            onClick={randomPick}
            disabled={rollingIndex !== null}
          >
            🎲 {rollingIndex !== null ? t.search.rolling : t.search.random}
          </button>
        )}
        <button
          className="btn btn-ghost"
          onClick={() =>
            openOnTv(
              playing
                ? `https://www.youtube.com/watch?v=${playing.id}`
                : ytUrl(spin.query, spin.sort),
            )
          }
        >
          {t.common.inBrowser}
        </button>
        <button className="btn" onClick={onClose}>
          ✕ {t.common.close}
        </button>
      </div>

      {playing ? (
        <div className="watch-layout">
          <div className="watch-main">
            <iframe
              src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0`}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              title={t.search.playerTitle}
            />
            <h2 className="watch-title">{playing.title}</h2>
            <div className="watch-meta">
              <span className={playing.views === 0 ? 'zero-views' : ''}>
                {fmtViews(playing.views, t)}
              </span>
              <span className={details?.likes === 0 ? 'zero-views' : ''}>· {likesLabel()}</span>
              {details?.commentsDisabled && (
                <span className="zero-views">· {t.watch.commentsOff}</span>
              )}
              <span>
                ·{' '}
                {details?.uploaded
                  ? fmtDate(details.uploaded, t)
                  : fmtRelative(playing.published, t)}
              </span>
            </div>
            {details?.description && <p className="watch-desc">{details.description}</p>}
          </div>

          <aside className="watch-side">
            <div className="channel-card">
              {channel?.avatar && <img className="channel-avatar" src={channel.avatar} alt="" />}
              <div className="channel-name">{channel?.name ?? playing.channel}</div>
              <div className="channel-stats">
                <span>{subscribersLabel()}</span>
                {channel?.videoCount != null && <span>· {t.watch.videos(channel.videoCount)}</span>}
              </div>
              {channel?.description && <p className="channel-desc">{channel.description}</p>}
              <button
                className="btn btn-ghost"
                onClick={() => openOnTv(`https://www.youtube.com/channel/${playing.channelId}`)}
              >
                {t.watch.openChannel}
              </button>
            </div>

            <div className="side-results">
              {results
                ?.filter((r) => r.id !== playing.id)
                .slice(0, 12)
                .map((video) => (
                  <VideoRow key={video.id} video={video} t={t} onPick={setPlaying} compact />
                ))}
            </div>
          </aside>
        </div>
      ) : search.failed ? (
        <div className="search-empty">
          <p className="hint">{t.search.failed}</p>
          <button
            className="btn btn-primary"
            onClick={() => openOnTv(ytUrl(spin.query, spin.sort))}
          >
            {t.search.openInBrowser}
          </button>
        </div>
      ) : results == null ? (
        <p className="hint search-empty">{t.search.searching}</p>
      ) : results.length === 0 ? (
        <p className="hint search-empty">{t.search.noResults}</p>
      ) : (
        <div className={`search-list ${rollingIndex !== null ? 'is-rolling' : ''}`}>
          {results.map((video, i) => (
            <VideoRow
              key={video.id}
              video={video}
              t={t}
              onPick={setPlaying}
              index={i}
              highlighted={rollingIndex === i}
              picked={pickedIndex === i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
