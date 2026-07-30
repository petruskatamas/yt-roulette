import { useMemo, useState } from 'react'
import { useGame } from '@/lib/gameClient'
import { CHALLENGES, hasBingo } from '../data/challenges'
import { ytUrl } from '../data/patterns'
import type { GamePlayer } from '../types'
import { BingoCard } from '../components/BingoCard'

function CardBuilder({
  player,
  onSubmit,
}: {
  player: GamePlayer
  onSubmit: (texts: string[]) => void
}) {
  const [texts, setTexts] = useState<string[]>(Array(24).fill(''))
  const placeholders = useMemo(
    () => [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 24),
    [],
  )
  const filled = texts.filter((t) => t.trim()).length

  const setAt = (i: number, value: string) =>
    setTexts((ts) => ts.map((t, j) => (j === i ? value : t)))

  const fillRandom = () => {
    const used = new Set(texts.map((t) => t.trim().toLowerCase()).filter(Boolean))
    const pool = CHALLENGES.filter((c) => !used.has(c.toLowerCase())).sort(
      () => Math.random() - 0.5,
    )
    setTexts((ts) => ts.map((t) => (t.trim() ? t : pool.pop() ?? t)))
  }

  return (
    <div className="player-screen">
      <header className="pheader">
        <div className="pname">✍️ {player.name}</div>
        <div className="hint">írd meg a bingókártyád</div>
      </header>

      <p className="builder-intro">
        24 dolog, amire fogadsz, hogy ma este felbukkan a nulla nézettségű videókban.
        A középső kocka ajándék. Légy konkrét, légy fura — vitás esetben a csapat dönt.
      </p>

      <div className="builder-list">
        {texts.map((t, i) => (
          <input
            key={i}
            className="builder-input"
            value={t}
            onChange={(e) => setAt(i, e.target.value)}
            placeholder={`pl. ${placeholders[i]}`}
            maxLength={60}
          />
        ))}
      </div>

      <div className="builder-footer">
        <div className="builder-count">{filled}/24</div>
        <button className="btn" onClick={fillRandom} disabled={filled === 24}>
          ✨ Üresek kitöltése
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit(texts.map((t) => t.trim()))}
          disabled={filled < 24}
        >
          Mehet ▸
        </button>
      </div>
    </div>
  )
}

export function PlayerView({ playerId }: { playerId: string }) {
  const { state, post, offline } = useGame(1000)

  if (!state) {
    return (
      <div className="center-note">
        {offline ? 'Nem érem el a játékot — egy Wi-Fi-n vagy a TV-vel?' : 'Kapcsolódás…'}
      </div>
    )
  }

  const me = state.players.find((p) => p.id === playerId)
  if (!me) {
    return (
      <div className="center-note">
        🫥 Nem vagy benne ebben a játékban (újraindult?).<br />
        Kérd meg a házigazdát, hogy adjon hozzá, aztán olvasd be újra a QR-kódod.
      </div>
    )
  }

  if (!me.cells) {
    return <CardBuilder player={me} onSubmit={(texts) => post('/card', { playerId, texts })} />
  }

  const spinner = state.players[state.current]
  const myTurn = spinner?.id === me.id
  const marks = me.cells.filter((c) => c.marked && !c.free).length
  const iWon = hasBingo(me.cells)
  const lastSpin = state.lastSpin

  return (
    <div className="player-screen">
      <header className="pheader">
        <div className="pname">{me.name}</div>
        <div className={`pturn ${myTurn ? 'is-me' : ''}`}>
          {state.phase === 'setup'
            ? 'várunk, hogy a házigazda elindítsa…'
            : myTurn
              ? '🎯 TE PÖRGETSZ — nyomd meg a gombot!'
              : `🎯 ${spinner?.name} pörget`}
        </div>
      </header>

      {state.celebration && (
        <div className="mini-celebration">
          🎉 BINGÓ — {state.celebration.name}! 🎉
        </div>
      )}

      {iWon && !state.celebration && (
        <div className="mini-celebration">🏆 BINGÓD van — kiálts!</div>
      )}

      {lastSpin && (
        <a
          className="pspin"
          href={ytUrl(lastSpin.query, lastSpin.sort)}
          target="_blank"
          rel="noreferrer"
        >
          <span className="pspin-label">{lastSpin.emoji} aktuális keresés</span>
          <span className="pspin-query">{lastSpin.query}</span>
          <span className="pspin-open">megnyit ↗</span>
        </a>
      )}

      <BingoCard cells={me.cells} onToggle={(i) => post('/toggle', { playerId, index: i })} />

      <div className="pfooter">
        <span className="hint">{marks}/24 jelölve · koppints a kockára, ha kiszúrtad</span>
        {offline && <span className="offline-note">⚠️ újracsatlakozás…</span>}
      </div>
    </div>
  )
}
