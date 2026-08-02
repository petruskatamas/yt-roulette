import { useCallback, useEffect, useRef, useState } from 'react'
import { useGame, useWakeLock } from '@/lib/gameClient'
import { messages } from '@/lib/i18n'
import { accept, fanfare, initSoundUnlock, markTick, reject, voteBlip } from '@/lib/sound'
import { SEGMENTS } from '@/data/patterns'
import type { Segment, Spin, Verdict, YtResult } from '@/types'
import { BingoCard } from '@/components/BingoCard'
import { Celebration } from '@/components/Celebration'
import { ClaimReview } from '@/components/ClaimReview'
import { Dialog } from '@/components/Dialog'
import { JoinGrid } from '@/components/JoinGrid'
import { PlayerList } from '@/components/PlayerList'
import { SearchScreen } from '@/components/SearchScreen'
import { SetupScreen } from '@/components/SetupScreen'
import { SpinPanel } from '@/components/SpinPanel'
import { Wheel } from '@/components/Wheel'
import type { WheelHandle } from '@/components/Wheel'

type Confirm = { text: string; label: string; action: () => void }
type RoundMode = 'keep' | 'shuffle' | 'rewrite' | 'new'

// Events older than this were already on screen before we loaded; don't replay them.
const FRESH_MS = 6000
const VERDICT_HOLD_MS = 1900

export function HostView() {
  const { state, post, offline } = useGame(800)
  const t = messages(state?.locale)

  const [searchOpen, setSearchOpen] = useState(false)
  const [watching, setWatching] = useState<YtResult | null>(null)
  const [inspectId, setInspectId] = useState<string | null>(null)
  const [showLinks, setShowLinks] = useState(false)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [verdictCard, setVerdictCard] = useState<Verdict | null>(null)
  const wheelRef = useRef<WheelHandle>(null)

  useWakeLock()
  useEffect(() => initSoundUnlock(), [])
  useEffect(() => {
    document.documentElement.lang = t.bcp47.slice(0, 2)
  }, [t])

  // ————— reacting to what the server reports —————

  const spinRequested = state?.spinRequested
  useEffect(() => {
    if (spinRequested) wheelRef.current?.spin()
  }, [spinRequested, state?.version])

  const lastMarkTs = state?.marks[0]?.ts
  const seenMark = useRef(0)
  useEffect(() => {
    if (!lastMarkTs || lastMarkTs === seenMark.current) return
    seenMark.current = lastMarkTs
    if (Date.now() - lastMarkTs < FRESH_MS) markTick()
  }, [lastMarkTs])

  const lastVote = state?.lastVote
  const seenVote = useRef(0)
  useEffect(() => {
    if (!lastVote || lastVote.ts === seenVote.current) return
    seenVote.current = lastVote.ts
    if (Date.now() - lastVote.ts < FRESH_MS) voteBlip(lastVote.n - 1, lastVote.valid)
  }, [lastVote])

  const lastVerdict = state?.lastVerdict
  const seenVerdict = useRef(0)
  useEffect(() => {
    if (!lastVerdict || lastVerdict.ts === seenVerdict.current) return
    seenVerdict.current = lastVerdict.ts
    if (Date.now() - lastVerdict.ts > FRESH_MS) return

    setVerdictCard(lastVerdict)
    if (lastVerdict.accepted) accept()
    else reject()
    const timer = setTimeout(() => setVerdictCard(null), VERDICT_HOLD_MS)
    return () => clearTimeout(timer)
  }, [lastVerdict])

  const celebrationTs = state?.celebration?.ts
  useEffect(() => {
    if (celebrationTs) fanfare()
  }, [celebrationTs])

  const roundWonBy = state?.roundWonBy
  useEffect(() => {
    if (roundWonBy) {
      setSearchOpen(false)
      setWatching(null)
    }
  }, [roundWonBy])

  // ————— telling the server what the TV is doing —————

  const serverSearchOpen = state?.searchOpen
  const serverWatching = state?.nowPlaying?.title ?? null
  const watchingTitle = watching?.title ?? null
  useEffect(() => {
    if (serverSearchOpen === undefined) return
    if (serverSearchOpen === searchOpen && serverWatching === watchingTitle) return
    post('/searching', {
      open: searchOpen,
      video: watching ? { title: watching.title, thumb: watching.thumb } : null,
    })
  }, [searchOpen, serverSearchOpen, watchingTitle, serverWatching, watching, post])

  const onWatchChange = useCallback((video: YtResult | null) => setWatching(video), [])

  if (!state) {
    return <div className="center-note">{offline ? t.host.serverDown : t.common.connecting}</div>
  }

  if (state.phase === 'setup') {
    return <SetupScreen state={state} t={t} post={post} />
  }

  const spinner = state.players[state.current]
  const inspected = state.players.find((p) => p.id === inspectId)
  const winner = state.players.find((p) => p.id === state.roundWonBy)
  const claim = state.claims[0]
  const reviewing = !winner && !searchOpen && (!!claim || !!verdictCard)

  const handleLand = (segment: Segment) => {
    const spin: Spin = {
      ...segment.gen(),
      player: spinner?.name ?? '?',
      segmentId: segment.id,
    }
    post('/spin', { spin })
  }

  const askNewGame = () =>
    setConfirm({
      text: t.confirm.newGameText,
      label: t.confirm.newGameLabel,
      action: () => {
        post('/reset')
        setInspectId(null)
      },
    })

  const askRound = (mode: Extract<RoundMode, 'rewrite' | 'new'>) =>
    setConfirm({
      text: mode === 'rewrite' ? t.confirm.rewriteText : t.confirm.redealText,
      label: mode === 'rewrite' ? t.confirm.rewriteLabel : t.confirm.redealLabel,
      action: () => post('/round', { mode }),
    })

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
          <button className="btn btn-ghost" onClick={askNewGame}>
            {t.host.newGame}
          </button>
        </div>
      </header>

      <main className="tv-main">
        <section className="panel tv-wheel-panel">
          <Wheel ref={wheelRef} segments={SEGMENTS} onLand={handleLand} />
        </section>

        <section className="tv-side">
          <SpinPanel spin={state.lastSpin} t={t} onSearch={() => setSearchOpen(true)} />
          <PlayerList
            players={state.players}
            currentIndex={state.current}
            t={t}
            onInspect={setInspectId}
          />
        </section>
      </main>

      <div className="mark-toasts">
        {state.marks.map((mark) => (
          <div key={`${mark.ts}-${mark.player}`} className="mark-toast">
            ✓ <b style={{ color: mark.color }}>{mark.player}</b>: „{mark.text}”
          </div>
        ))}
      </div>

      {inspected && (
        <Dialog className="inspect-dialog" onClose={() => setInspectId(null)}>
          <div className="inspect-title">
            <span style={{ color: inspected.color }}>{t.host.cardOf(inspected.name)}</span>
            {inspected.wins > 0 && <span className="status-wins"> 🏆{inspected.wins}</span>}
          </div>
          {inspected.cells ? (
            <BingoCard cells={inspected.cells} readOnly t={t} />
          ) : (
            <p className="hint">{t.host.stillWriting}</p>
          )}
          <button className="btn" onClick={() => setInspectId(null)}>
            {t.common.close}
          </button>
        </Dialog>
      )}

      {showLinks && (
        <Dialog className="dialog-wide" onClose={() => setShowLinks(false)}>
          <JoinGrid players={state.players} t={t} />
          <button className="btn" onClick={() => setShowLinks(false)}>
            {t.common.close}
          </button>
        </Dialog>
      )}

      {searchOpen && state.lastSpin && (
        <SearchScreen
          spin={state.lastSpin}
          t={t}
          onClose={() => setSearchOpen(false)}
          onWatchChange={onWatchChange}
        />
      )}

      {confirm && (
        <Dialog onTop onClose={() => setConfirm(null)}>
          <p className="confirm-text">{confirm.text}</p>
          <div className="editor-actions">
            <button className="btn" onClick={() => setConfirm(null)}>
              {t.common.cancel}
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                confirm.action()
                setConfirm(null)
              }}
            >
              {confirm.label}
            </button>
          </div>
        </Dialog>
      )}

      {reviewing && (
        <ClaimReview
          claim={claim}
          queueLength={state.claims.length}
          players={state.players}
          verdict={verdictCard}
          t={t}
          onDecideNow={(claimId) => post('/vote/close', { claimId })}
        />
      )}

      {winner && (
        <Celebration
          winner={winner}
          t={t}
          onRound={(mode) => post('/round', { mode })}
          onConfirmRound={askRound}
          onNewGame={askNewGame}
        />
      )}
    </div>
  )
}
