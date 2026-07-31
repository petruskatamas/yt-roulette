import { useEffect, useRef, useState } from 'react'
import { openOnTv, useGame, useJoinBase, useWakeLock } from '@/lib/gameClient'
import { SEGMENTS, ytUrl } from '../data/patterns'
import { bestLineProgress, hasBingo } from '../data/challenges'
import { fanfare, initSoundUnlock, markTick } from '../lib/sound'
import type { GamePlayer, Segment, Spin, YtChannel, YtResult, YtVideoDetails } from '../types'
import { Wheel } from '../components/Wheel'
import type { WheelHandle } from '../components/Wheel'
import { BingoCard } from '../components/BingoCard'
import { QR } from '../components/QR'

function JoinGrid({ players }: { players: GamePlayer[] }) {
  const joinBase = useJoinBase()
  if (players.length === 0) return null
  return (
    <div className="join-section">
      {joinBase?.includes('localhost') && (
        <p className="hint">
          ⚠️ Nem található hálózati cím — a gép ugyanazon a Wi-Fi-n legyen, mint a telefonok.
        </p>
      )}
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
      <p className="hint">
        Olvasd be a telefonoddal → írd meg a saját bingókártyád. ✅ = kártya leadva.
      </p>
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

  if (!state) {
    return (
      <div className="center-note">
        {offline ? 'A szerver nem elérhető — fut az `npm run dev`?' : 'Kapcsolódás…'}
      </div>
    )
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
        <p className="tagline">nulla nézettségű bingó · túra a YouTube lomtárában</p>

        <div className="setup-card">
          <h2>Ki játszik?</h2>
          <div className="name-row">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              placeholder="Játékos neve…"
              maxLength={20}
              autoFocus
            />
            <button className="btn" onClick={addPlayer}>Hozzáad</button>
          </div>
          <div className="player-chips">
            {state.players.map((p) => (
              <span key={p.id} className="chip">
                {p.name}
                <button className="chip-x" onClick={() => post('/players/remove', { id: p.id })}>×</button>
              </span>
            ))}
            {state.players.length === 0 && <span className="hint">Adj hozzá legalább egy játékost</span>}
          </div>

          <JoinGrid players={state.players} />

          <button
            className="btn btn-primary btn-big"
            onClick={() => post('/start')}
            disabled={state.players.length === 0}
          >
            Játék indítása ▸
          </button>
        </div>

        <details className="rules">
          <summary>Hogyan játsszátok?</summary>
          <ol>
            <li>Adjatok hozzá mindenkit itt a TV-n, majd mindenki beolvassa a saját QR-kódját a telefonjával.</li>
            <li>A telefonján mindenki megírja a saját 5×5-ös bingókártyáját — csupa olyat, amiről azt hiszi, elő fog kerülni a YouTube mélyéről („szülinapi buli”, „pontosan 0 megtekintés”, „valakinek a macskája”…).</li>
            <li>Felváltva pörgetitek a kerekét a TV-n. A kerék egy keresést generál ~0 megtekintésű videókra — cím nélküliekre, elfeledettekre.</li>
            <li>Nyisd meg a keresést, válassz egy eltemetett videót, és nézzétek meg együtt. A játékosok a telefonjukon jelölik a találataikat.</li>
            <li>Az első teljes sor, oszlop vagy átló — és a TV felrobban. 🎉</li>
          </ol>
        </details>
      </div>
    )
  }

  const spinner = state.players[state.current]
  const lastSpin = state.lastSpin
  const inspected = state.players.find((p) => p.id === inspectId)

  const handleLand = (segment: Segment) => {
    const q = segment.gen()
    const spin: Spin = {
      ...q,
      player: spinner?.name ?? '?',
      segmentId: segment.id,
      segmentLabel: segment.label,
      emoji: segment.emoji,
    }
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
      text: 'Mindenkinek véget ér a játék: játékosok, kártyák, győzelmek törlődnek. Biztos?',
      label: 'Új játék',
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
        {offline && <span className="offline-note">⚠️ megszakadt a kapcsolat…</span>}
        <div className="topbar-actions">
          <button className="btn btn-ghost" onClick={() => setShowLinks(true)}>
            Csatlakozás
          </button>
          <button className="btn btn-ghost" onClick={newGame}>Új játék</button>
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
                  <span className="spin-seg">{lastSpin.emoji} {lastSpin.segmentLabel}</span>
                  <span className="spin-map">{lastSpin.map}</span>
                  <span className="spin-player">pörgette: {lastSpin.player}</span>
                </div>
                <button className="spin-query" onClick={copyQuery} title="Kattints a másoláshoz">
                  {lastSpin.query}
                  <span className="copy-hint">{copied ? '✓ másolva' : '⧉'}</span>
                </button>
                <div className="spin-actions">
                  <button className="btn btn-primary" onClick={() => setSearchOpen(true)}>
                    🔍 Keresés
                  </button>                  <button
                    className="btn btn-ghost"
                    onClick={() => openOnTv(ytUrl(lastSpin.query, lastSpin.sort))}
                  >
                    Böngészőben ↗
                  </button>
                </div>
                {lastSpin.sort === 'date' && (
                  <div className="spin-note">feltöltési idő szerint rendezve — a legújabb elöl</div>
                )}
                <p className="spin-tip">{lastSpin.tip}</p>
              </div>
            ) : (
              <p className="spin-placeholder">
                Pörgesd meg a kereket!
              </p>
            )}
          </div>

          <div className="panel tv-players">
            <h2 className="panel-title">Játékosok</h2>
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
                      {bingo ? '🏆 BINGÓ' : p.cells ? `${marks}/24 jelölve` : '✍️ kártyát ír…'}
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
              <span style={{ color: inspected.color }}>{inspected.name}</span> kártyája
              {inspected.wins > 0 && <span className="status-wins"> 🏆{inspected.wins}</span>}
            </div>
            {inspected.cells ? (
              <BingoCard cells={inspected.cells} readOnly />
            ) : (
              <p className="hint">✍️ Még írja a kártyáját…</p>
            )}
            <button className="btn" onClick={() => setInspectId(null)}>Bezárás</button>
          </div>
        </div>
      )}

      {showLinks && (
        <div className="editor-overlay" onClick={() => setShowLinks(false)}>
          <div className="editor-card dialog-wide" onClick={(e) => e.stopPropagation()}>
            <JoinGrid players={state.players} />
            <button className="btn" onClick={() => setShowLinks(false)}>Bezárás</button>
          </div>
        </div>
      )}

      {searchOpen && lastSpin && (
        <div className="search-screen">
          <div className="search-head">
            {playing && (
              <button className="btn" onClick={() => setPlaying(null)}>◂ Találatok</button>
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
              Böngészőben ↗
            </button>
            <button className="btn" onClick={() => setSearchOpen(false)}>✕ Bezárás</button>
          </div>

          {playing ? (
            <div className="watch-layout">
              <div className="watch-main">
                <iframe
                  src={`https://www.youtube.com/embed/${playing.id}?autoplay=1&rel=0`}
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                  title="YouTube lejátszó"
                />
                <h2 className="watch-title">{playing.title}</h2>
                <div className="watch-meta">
                  <span className={playing.views === 0 ? 'zero-views' : ''}>
                    {playing.views < 0
                      ? '? megtekintés'
                      : playing.views === 0
                        ? '☠️ 0 megtekintés'
                        : `${playing.views.toLocaleString('hu-HU')} megtekintés`}
                  </span>
                  <span className={details?.likes === '0' ? 'zero-views' : ''}>
                    · {details ? (details.likes === '' ? 'rejtett' : details.likes) : '…'} lájk
                  </span>
                  {details?.commentsDisabled && (
                    <span className="zero-views">· 🚫 kikapcsolt kommentek</span>
                  )}
                  <span>· {details?.uploaded || playing.published}</span>
                </div>
                {details?.description && (
                  <p className="watch-desc">{details.description}</p>
                )}
              </div>

              <aside className="watch-side">
                <div className="channel-card">
                  {channel?.avatar && (
                    <img className="channel-avatar" src={channel.avatar} alt="" />
                  )}
                  <div className="channel-name">{channel?.name ?? playing.channel}</div>
                  <div className="channel-stats">
                    <span>{channel?.subscribers || 'rejtett feliratkozók'}</span>
                    {channel?.videoCount && <span>· {channel.videoCount}</span>}
                  </div>
                  {channel?.description && (
                    <p className="channel-desc">{channel.description}</p>
                  )}
                  <button
                    className="btn btn-ghost"
                    onClick={() =>
                      openOnTv(`https://www.youtube.com/channel/${playing.channelId}`)
                    }
                  >
                    Csatorna megnyitása ↗
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
                          {r.views < 0 ? '?' : r.views.toLocaleString('hu-HU')} megtekintés
                          {r.published && ` · ${r.published}`}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </aside>
            </div>
          ) : searchFailed ? (
            <div className="search-empty">
              <p className="hint">Nem sikerült lekérni a találatokat — nyisd meg böngészőben.</p>
              <button
                className="btn btn-primary"
                onClick={() => openOnTv(ytUrl(lastSpin.query, lastSpin.sort))}
              >
                Megnyitás Böngészőben ↗
              </button>
            </div>
          ) : results == null ? (
            <p className="hint search-empty">Keresés…</p>
          ) : results.length === 0 ? (
            <p className="hint search-empty">Semmi találat — pörgessetek újra</p>
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
                      {r.views < 0
                        ? '? megtekintés'
                        : r.views === 0
                          ? '☠️ 0 megtekintés'
                          : `${r.views.toLocaleString('hu-HU')} megtekintés`}
                      {r.published && <span className="yt-meta"> · {r.published}</span>}
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
              <button className="btn" onClick={() => setConfirmBox(null)}>Mégse</button>
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
            <div className="celebration-title">B I N G Ó !</div>
            <div className="celebration-name" style={{ color: winner.color }}>
              {winner.name}
            </div>
            {winner.cells && (
              <div className="celebration-card">
                <BingoCard cells={winner.cells} readOnly />
              </div>
            )}
            <div className="celebration-actions">
              <button
                className="btn btn-primary"
                onClick={() => post('/round', { redeal: false })}
              >
                Új kör (kártyák maradnak)
              </button>
              <button
                className="btn"
                onClick={() =>
                  setConfirmBox({
                    text: 'Új kör új kártyákkal — mindenki újraírja a sajátját a telefonján. Mehet?',
                    label: 'Új kártyák',
                    action: () => post('/round', { redeal: true }),
                  })
                }
              >
                Új kör új kártyákkal
              </button>
              <button className="btn btn-ghost" onClick={newGame}>Új játék</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
