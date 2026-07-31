import { useEffect, useRef, useState } from 'react'
import { openOnTv, useGame, useJoinBase, useWakeLock } from '@/lib/gameClient'
import { SEGMENTS, ytUrl } from '../data/patterns'
import { bestLineProgress, hasBingo } from '../data/challenges'
import { fanfare, initSoundUnlock, markTick } from '../lib/sound'
import { fmtDate, fmtRelative, fmtViews, localeOptions, messages } from '../lib/i18n'
import type { Messages } from '../lib/i18n'
import type { GamePlayer, Segment, Spin, YtChannel, YtResult, YtVideoDetails } from '../types'
import { Wheel } from '../components/Wheel'
import type { WheelHandle } from '../components/Wheel'
import { BingoCard } from '../components/BingoCard'
import { QR } from '../components/QR'

function JoinGrid({ players, t }: { players: GamePlayer[]; t: Messages }) {
  const joinBase = useJoinBase()
  if (players.length === 0) return null
  return (
    <div className="join-section">
      {joinBase?.includes('localhost') && <p className="hint">{t.join.noLan}</p>}
      <div className="join-grid">
        {players.map((p) => {
          const url = `${joinBase ?? ''}/#/p/${p.id}`
          return (
            <div key={p.id} className="join-card">
              <div className="join-name" style={{ color: p.color }}>
                {p.name} {p.cells ? '✅' : '✍️'}
              </div>
              {joinBase && <QR text={url} />}
              <div className="join-url">{url}</div>
            </div>
          )
        })}
      </div>
      <p className="hint">{t.join.scanHint}</p>
    </div>
  )
}

export function HostView() {
  const { state, post, offline } = useGame(800)
  const [nameInput, setNameInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [inspectId, setInspectId] = useState<string | null>(null)
  const [showLinks, setShowLinks] = useState(false)
  const [confirmBox, setConfirmBox] = useState<{
    text: string
    label: string
    action: () => void
  } | null>(null)
  const wheelRef = useRef<WheelHandle>(null)

  useWakeLock()
  useEffect(() => initSoundUnlock(), [])

  const celebrationTs = state?.celebration?.ts
  useEffect(() => {
    if (celebrationTs) fanfare()
  }, [celebrationTs])

  // a phone asked for a spin; no-ops while the wheel is already spinning
  const spinRequested = state?.spinRequested
  useEffect(() => {
    if (spinRequested) wheelRef.current?.spin()
  }, [spinRequested, state?.version])

  const lastMarkTs = state?.marks[0]?.ts
  const markSeen = useRef(false)
  useEffect(() => {
    if (!markSeen.current) {
      markSeen.current = true // skip marks already present at page load
      return
    }
    if (lastMarkTs) markTick()
  }, [lastMarkTs])

  const [searchOpen, setSearchOpen] = useState(false)
  const [playing, setPlaying] = useState<YtResult | null>(null)
  const [results, setResults] = useState<YtResult[] | null>(null)
  const [searchFailed, setSearchFailed] = useState(false)
  const [channel, setChannel] = useState<YtChannel | null>(null)
  const [details, setDetails] = useState<YtVideoDetails | null>(null)

  const playingId = playing?.id
  useEffect(() => {
    if (!playingId) return
    let cancelled = false
    setDetails(null)
    fetch(`/api/video?id=${playingId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled) setDetails(d.details)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [playingId])

  const playingChannelId = playing?.channelId
  useEffect(() => {
    if (!playingChannelId) return
    let cancelled = false
    setChannel(null)
    fetch(`/api/channel?id=${playingChannelId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled) setChannel(d.channel)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [playingChannelId])

  const query = state?.lastSpin?.query
  const sort = state?.lastSpin?.sort
  useEffect(() => {
    if (!searchOpen || !query) return
    let cancelled = false
    setResults(null)
    setSearchFailed(false)
    setPlaying(null)
    fetch(`/api/search?q=${encodeURIComponent(query)}&sort=${sort}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (!cancelled) setResults(d.results)
      })
      .catch(() => {
        if (!cancelled) setSearchFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [searchOpen, query, sort])

  const roundOver = !!state?.roundWonBy
  useEffect(() => {
    if (roundOver) {
      setSearchOpen(false)
      setPlaying(null)
    }
  }, [roundOver])

  const t = messages(state?.locale)

  useEffect(() => {
    document.documentElement.lang = t.bcp47.slice(0, 2)
  }, [t])

  if (!state) {
    return <div className="center-note">{offline ? t.host.serverDown : t.common.connecting}</div>
  }

  const addPlayer = () => {
    const name = nameInput.trim()
    if (!name) return
    post('/players', { name })
    setNameInput('')
  }

  if (state.phase === 'setup') {
    return (
      <div className="setup-screen">
        <h1 className="logo">
          <span className="logo-yt">YT</span> ROULETTE
        </h1>
        <p className="tagline">{t.setup.tagline}</p>

        <div className="setup-card">
          <div className="lang-row">
            <span className="hint">{t.setup.language}</span>
            <select
              className="lang-select"
              value={state.locale}
              onChange={(e) => post('/locale', { locale: e.target.value })}
            >
              {localeOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <h2>{t.setup.who}</h2>
          <div className="name-row">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder={t.setup.namePlaceholder}
              maxLength={20}
              autoFocus
            />
            <button className="btn" onClick={addPlayer}>{t.setup.add}</button>
          </div>
          <div className="player-chips">
            {state.players.map((p) => (
              <span key={p.id} className="chip">
                {p.name}
                <button className="chip-x" onClick={() => post('/players/remove', { id: p.id })}>×</button>
              </span>
            ))}
            {state.players.length === 0 && <span className="hint">{t.setup.needPlayer}</span>}
          </div>

          <JoinGrid players={state.players} t={t} />

          <button
            className="btn btn-primary btn-big"
            onClick={() => post('/start')}
            disabled={state.players.length === 0}
          >
            {t.setup.start}
          </button>
        </div>

        <details className="rules">
          <summary>{t.setup.rulesTitle}</summary>
          <ol>
            {t.setup.rules.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ol>
        </details>
      </div>
    )
  }

  const spinner = state.players[state.current]
  const lastSpin = state.lastSpin
  const lastSegment = SEGMENTS.find((s) => s.id === lastSpin?.segmentId)
  const lastSegText = lastSpin
    ? t.segments[lastSpin.segmentId as keyof typeof t.segments]
    : undefined
  const inspected = state.players.find((p) => p.id === inspectId)

  const handleLand = (segment: Segment) => {
    const q = segment.gen()
    const spin: Spin = { ...q, player: spinner?.name ?? '?', segmentId: segment.id }
    post('/spin', { spin })
    setCopied(false)
  }

  const copyQuery = async () => {
    if (!lastSpin) return
    try {
      await navigator.clipboard.writeText(lastSpin.query)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  const newGame = () =>
    setConfirmBox({
      text: t.confirm.newGameText,
      label: t.confirm.newGameLabel,
      action: () => {
        post('/reset')
        setInspectId(null)
      },
    })

  const winner = state.players.find((p) => p.id === state.roundWonBy)

  return (
    <div className="tv-screen">
      <header className="topbar">
        <h1 className="logo logo-small">
          <span className="logo-yt">YT</span> ROULETTE
        </h1>
        {offline && <span className="offline-note">{t.host.offline}</span>}
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={() => setShowLinks(true)}>
            {t.host.connect}
          </button>
          <button className="btn btn-ghost" onClick={newGame}>{t.host.newGame}</button>
        </div>
      </header>

      <main className="tv-main">
        <section className="panel tv-wheel-panel">
          <Wheel ref={wheelRef} segments={SEGMENTS} onLand={handleLand} />
        </section>

        <section className="tv-side">
          <div className="panel tv-spin">
            {lastSpin ? (
              <div className="spin-result" key={`${lastSpin.player}-${lastSpin.query}`}>
                <div className="spin-meta">
                  <span className="spin-seg">
                    {lastSegment?.emoji} {lastSegText?.label}
                  </span>
                  <span className="spin-player">{t.host.spunBy(lastSpin.player)}</span>
                </div>
                <button className="spin-query" onClick={copyQuery} title={t.host.copyTitle}>
                  {lastSpin.query}
                  <span className="copy-hint">{copied ? t.host.copied : '⧉'}</span>
                </button>
                <div className="spin-actions">
                  <button className="btn btn-primary" onClick={() => setSearchOpen(true)}>
                    {t.host.search}
                  </button>
                  <button
                    className="btn btn-ghost"
                    onClick={() => openOnTv(ytUrl(lastSpin.query, lastSpin.sort))}
                  >
                    {t.common.inBrowser}
                  </button>
                </div>
                {lastSpin.sort === 'date' && (
                  <div className="spin-note">{t.host.sortedByDate}</div>
                )}
                <p className="spin-tip">{lastSegText?.tip}</p>
              </div>
            ) : (
              <p className="spin-placeholder">{t.host.spinPrompt}</p>
            )}
          </div>

          <div className="panel tv-players">
            <h2 className="panel-title">{t.host.players}</h2>
            <div className="status-list">
              {state.players.map((p, i) => {
                const marks = p.cells?.filter((c) => c.marked && !c.free).length ?? 0
                const bingo = p.cells ? hasBingo(p.cells) : false
                const best = !bingo && p.cells ? bestLineProgress(p.cells) : 0
                return (
                  <button
                    key={p.id}
                    className={['status-item', bingo ? 'has-bingo' : ''].join(' ')}
                    onClick={() => setInspectId(p.id)}
                  >
                    <span className="status-turn">{i === state.current ? '🎯' : ''}</span>
                    <span className="status-dot" style={{ background: p.color }} />
                    <span className="status-name">
                      {p.name}
                      {p.wins > 0 && <span className="status-wins"> 🏆{p.wins}</span>}
                    </span>
                    {best >= 4 && <span className="status-danger">🔥 4/5</span>}
                    <span className="status-info">
                      {bingo ? t.host.bingo : p.cells ? t.host.marked(marks) : t.host.writingCard}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <div className="mark-toasts">
        {state.marks.map((m) => (
          <div key={`${m.ts}-${m.player}`} className="mark-toast">
            ✓ <b style={{ color: m.color }}>{m.player}</b>: „{m.text}”
          </div>
        ))}
      </div>

      {inspected && (
        <div className="editor-overlay" onClick={() => setInspectId(null)}>
          <div className="editor-card inspect-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="inspect-title">
              <span style={{ color: inspected.color }}>{t.host.cardOf(inspected.name)}</span>
              {inspected.wins > 0 && <span className="status-wins"> 🏆{inspected.wins}</span>}
            </div>
            {inspected.cells ? (
              <BingoCard cells={inspected.cells} readOnly t={t} />
            ) : (
              <p className="hint">{t.host.stillWriting}</p>
            )}
            <button className="btn" onClick={() => setInspectId(null)}>{t.common.close}</button>
          </div>
        </div>
      )}

      {showLinks && (
        <div className="editor-overlay" onClick={() => setShowLinks(false)}>
          <div className="editor-card dialog-wide" onClick={(e) => e.stopPropagation()}>
            <JoinGrid players={state.players} t={t} />
            <button className="btn" onClick={() => setShowLinks(false)}>{t.common.close}</button>
          </div>
        </div>
      )}

      {searchOpen && lastSpin && (
        <div className="search-screen">
          <div className="search-head">
            {playing && (
              <button className="btn" onClick={() => setPlaying(null)}>{t.search.results}</button>
            )}
            <span className="search-query">{lastSpin.query}</span>
            <button
              className="btn btn-ghost"
              onClick={() =>
                openOnTv(
                  playing
                    ? `https://www.youtube.com/watch?v=${playing.id}`
                    : ytUrl(lastSpin.query, lastSpin.sort),
                )
              }
            >
              {t.common.inBrowser}
            </button>
            <button className="btn" onClick={() => setSearchOpen(false)}>✕ {t.common.close}</button>
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
                  <span className={details?.likes === 0 ? 'zero-views' : ''}>
                    ·{' '}
                    {!details
                      ? '…'
                      : details.likes == null
                        ? t.watch.likesHidden
                        : details.likesApprox
                          ? t.watch.likesApprox(details.likesText)
                          : t.watch.likes(details.likes)}
                  </span>
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
                  {channel?.avatar && (
                    <img className="channel-avatar" src={channel.avatar} alt="" />
                  )}
                  <div className="channel-name">{channel?.name ?? playing.channel}</div>
                  <div className="channel-stats">
                    <span>
                      {!channel
                        ? '…'
                        : channel.subscribers == null
                          ? t.watch.subscribersHidden
                          : channel.subscribersApprox
                            ? t.watch.subscribersApprox(channel.subscribersText)
                            : t.watch.subscribers(channel.subscribers)}
                    </span>
                    {channel?.videoCount != null && (
                      <span>· {t.watch.videos(channel.videoCount)}</span>
                    )}
                  </div>
                  {channel?.description && <p className="channel-desc">{channel.description}</p>}
                  <button
                    className="btn btn-ghost"
                    onClick={() =>
                      openOnTv(`https://www.youtube.com/channel/${playing.channelId}`)
                    }
                  >
                    {t.watch.openChannel}
                  </button>
                </div>

                <div className="side-results">
                  {results?.filter((r) => r.id !== playing.id).slice(0, 12).map((r) => (
                    <button key={r.id} className="yt-row is-compact" onClick={() => setPlaying(r)}>
                      <span className="yt-thumb">
                        <img src={r.thumb} alt="" loading="lazy" />
                        {r.duration && <span className="yt-duration">{r.duration}</span>}
                      </span>
                      <span className="yt-info">
                        <span className="yt-title">{r.title}</span>
                        <span className="yt-meta">{r.channel}</span>
                        <span className={`yt-meta ${r.views === 0 ? 'zero-views' : ''}`}>
                          {fmtViews(r.views, t)}
                          {r.published && ` · ${fmtRelative(r.published, t)}`}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          ) : searchFailed ? (
            <div className="search-empty">
              <p className="hint">{t.search.failed}</p>
              <button
                className="btn btn-primary"
                onClick={() => openOnTv(ytUrl(lastSpin.query, lastSpin.sort))}
              >
                {t.search.openInBrowser}
              </button>
            </div>
          ) : results == null ? (
            <p className="hint search-empty">{t.search.searching}</p>
          ) : results.length === 0 ? (
            <p className="hint search-empty">{t.search.noResults}</p>
          ) : (
            <div className="search-list">
              {results.map((r) => (
                <button key={r.id} className="yt-row" onClick={() => setPlaying(r)}>
                  <span className="yt-thumb">
                    <img src={r.thumb} alt="" loading="lazy" />
                    {r.duration && <span className="yt-duration">{r.duration}</span>}
                  </span>
                  <span className="yt-info">
                    <span className="yt-title">{r.title}</span>
                    <span className={`yt-stats ${r.views === 0 ? 'zero-views' : ''}`}>
                      {fmtViews(r.views, t)}
                      {r.published && (
                        <span className="yt-meta"> · {fmtRelative(r.published, t)}</span>
                      )}
                    </span>
                    <span className="yt-meta">{r.channel}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {confirmBox && (
        <div className="editor-overlay z-top" onClick={() => setConfirmBox(null)}>
          <div className="editor-card" onClick={(e) => e.stopPropagation()}>
            <p className="confirm-text">{confirmBox.text}</p>
            <div className="editor-actions">
              <button className="btn" onClick={() => setConfirmBox(null)}>{t.common.cancel}</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  confirmBox.action()
                  setConfirmBox(null)
                }}
              >
                {confirmBox.label}
              </button>
            </div>
          </div>
        </div>
      )}

      {winner && (
        <div className="celebration">
          <div className="celebration-inner">
            <div className="celebration-confetti">🎉 🎰 🎉</div>
            <div className="celebration-title">{t.celebration.title}</div>
            <div className="celebration-name" style={{ color: winner.color }}>
              {winner.name}
            </div>
            {winner.cells && (
              <div className="celebration-card">
                <BingoCard cells={winner.cells} readOnly t={t} />
              </div>
            )}
            <div className="celebration-actions">
              <button
                className="btn btn-primary"
                onClick={() => post('/round', { redeal: false })}
              >
                {t.celebration.keepCards}
              </button>
              <button
                className="btn"
                onClick={() =>
                  setConfirmBox({
                    text: t.confirm.redealText,
                    label: t.confirm.redealLabel,
                    action: () => post('/round', { redeal: true }),
                  })
                }
              >
                {t.celebration.newCards}
              </button>
              <button className="btn btn-ghost" onClick={newGame}>{t.host.newGame}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
