'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useGame, useWakeLock } from '@/lib/gameClient'
import { CHALLENGES, hasBingo } from '../data/challenges'
import { ytUrl } from '../data/patterns'
import { buzz, initSoundUnlock, pop } from '../lib/sound'
import type { GamePlayer } from '../types'
import { BingoCard } from '../components/BingoCard'

const draftKey = (playerId: string) => `ytr-draft-${playerId}`

function loadDraft(playerId: string): string[] {
  try {
    const raw = localStorage.getItem(draftKey(playerId))
    const arr = raw ? JSON.parse(raw) : null
    if (Array.isArray(arr) && arr.length === 24) return arr.map(String)
  } catch {
    /* corrupt draft */
  }
  return Array(24).fill('')
}

function BuilderCell({
  index,
  text,
  onTap,
  suppressClick,
}: {
  index: number
  text: string
  onTap: (index: number) => void
  suppressClick: React.RefObject<boolean>
}) {
  const drag = useDraggable({ id: index })
  const drop = useDroppable({ id: index })
  const setRefs = (el: HTMLElement | null) => {
    drag.setNodeRef(el)
    drop.setNodeRef(el)
  }
  return (
    <button
      ref={setRefs}
      {...drag.listeners}
      {...drag.attributes}
      className={[
        'eb-cell',
        text ? 'is-filled' : '',
        drag.isDragging ? 'is-dragging' : '',
        drop.isOver && !drag.isDragging ? 'is-drop' : '',
      ].join(' ')}
      onClick={() => {
        if (!suppressClick.current) onTap(index)
      }}
    >
      {text || '+'}
    </button>
  )
}

function CardBuilder({
  player,
  onSubmit,
}: {
  player: GamePlayer
  onSubmit: (texts: string[]) => void
}) {
  const [texts, setTexts] = useState<string[]>(() => loadDraft(player.id))
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const suppressClick = useRef(false)
  const placeholders = useMemo(
    () => [...CHALLENGES].sort(() => Math.random() - 0.5).slice(0, 24),
    [],
  )
  const filled = texts.filter((t) => t.trim()).length

  useEffect(() => {
    try {
      localStorage.setItem(draftKey(player.id), JSON.stringify(texts))
    } catch {
      /* storage full or blocked */
    }
  }, [texts, player.id])

  // taps under 8px stay clicks (open the editor); further = drag
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  )

  const setAt = (i: number, value: string) =>
    setTexts((ts) => ts.map((t, j) => (j === i ? value : t)))

  const swap = (a: number, b: number) =>
    setTexts((ts) => {
      const next = [...ts]
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })

  const unusedPool = () => {
    const used = new Set(texts.map((t) => t.trim().toLowerCase()).filter(Boolean))
    return CHALLENGES.filter((c) => !used.has(c.toLowerCase()))
  }

  const fillRandom = () => {
    const pool = unusedPool().sort(() => Math.random() - 0.5)
    setTexts((ts) => ts.map((t) => (t.trim() ? t : pool.pop() ?? t)))
  }

  const onDragStart = (e: DragStartEvent) => {
    suppressClick.current = true
    setActiveId(Number(e.active.id))
  }

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null)
    setTimeout(() => {
      suppressClick.current = false
    }, 0)
    if (e.over != null && e.over.id !== e.active.id) {
      swap(Number(e.active.id), Number(e.over.id))
    }
  }

  const onDragCancel = () => {
    setActiveId(null)
    setTimeout(() => {
      suppressClick.current = false
    }, 0)
  }

  const openEditor = (i: number) => {
    setEditing(i)
    setDraft(texts[i])
  }

  const saveEdit = () => {
    if (editing != null) setAt(editing, draft.trim())
    setEditing(null)
  }

  const clearEdit = () => {
    if (editing != null) setAt(editing, '')
    setEditing(null)
  }

  const randomIntoEdit = () => {
    const pool = unusedPool()
    if (pool.length) setDraft(pool[Math.floor(Math.random() * pool.length)])
  }

  return (
    <div className="player-screen">
      <header className="pheader">
        <div className="pname">✍️ {player.name}</div>
        <div className="hint">írd meg a bingókártyád</div>
      </header>

      <p className="builder-intro">
        24 dolog, amire fogadsz, hogy ma este felbukkan a nulla nézettségű videókban.
        Koppints egy kockára a szerkesztéshez, húzd egy másikra a cseréhez.
        A sarkok és az átlók több vonalban számítanak — oda tedd a tutikat.
      </p>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="eb-grid">
          {Array.from({ length: 25 }, (_, cell) => {
            if (cell === 12) {
              return (
                <div key={cell} className="eb-cell eb-free">
                  ☠️
                </div>
              )
            }
            const i = cell < 12 ? cell : cell - 1
            return (
              <BuilderCell
                key={cell}
                index={i}
                text={texts[i].trim()}
                onTap={openEditor}
                suppressClick={suppressClick}
              />
            )
          })}
        </div>
        <DragOverlay>
          {activeId != null && (
            <div className="eb-cell is-filled eb-overlay">
              {texts[activeId].trim() || '+'}
            </div>
          )}
        </DragOverlay>
      </DndContext>

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

      {editing != null && (
        <div className="editor-overlay" onClick={() => setEditing(null)}>
          <div className="editor-card" onClick={(e) => e.stopPropagation()}>
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
              placeholder={`pl. ${placeholders[editing]}`}
              maxLength={60}
            />
            <div className="editor-actions">
              <button className="btn" onClick={randomIntoEdit}>🎲</button>
              {texts[editing].trim() !== '' && (
                <button className="btn" onClick={clearEdit}>Törlés</button>
              )}
              <button className="btn btn-primary" onClick={saveEdit}>Mentés</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function PlayerView({ playerId }: { playerId: string }) {
  const { state, post, offline } = useGame(1000)

  useWakeLock()
  useEffect(() => initSoundUnlock(), [])

  const me = state?.players.find((p) => p.id === playerId)
  const hasCard = !!me?.cells
  useEffect(() => {
    if (hasCard) {
      try {
        localStorage.removeItem(draftKey(playerId))
      } catch {
        /* storage blocked */
      }
    }
  }, [hasCard, playerId])

  const iWonNow = me?.cells ? hasBingo(me.cells) : false
  const prevWon = useRef(false)
  useEffect(() => {
    if (iWonNow && !prevWon.current) buzz([100, 60, 100, 60, 250])
    prevWon.current = iWonNow
  }, [iWonNow])

  if (!state) {
    return (
      <div className="center-note">
        {offline ? 'Nem érem el a játékot — egy Wi-Fi-n vagy a TV-vel?' : 'Kapcsolódás…'}
      </div>
    )
  }

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

  const cells = me.cells
  const spinner = state.players[state.current]
  const myTurn = spinner?.id === me.id
  const marks = cells.filter((c) => c.marked && !c.free).length
  const iWon = hasBingo(cells)
  const lastSpin = state.lastSpin

  const toggle = (i: number) => {
    if (!cells[i].marked) {
      pop()
      buzz(40)
    }
    post('/toggle', { playerId, index: i })
  }

  return (
    <div className="player-screen">
      <header className="pheader">
        <div className="pname">{me.name}</div>
        <div className={`pturn ${myTurn ? 'is-me' : ''}`}>
          {state.phase === 'setup'
            ? 'várunk, hogy a házigazda elindítsa…'
            : myTurn
              ? '🎯 te jössz!'
              : `🎯 ${spinner?.name} pörget`}
        </div>
      </header>

      {state.phase === 'play' && myTurn && (
        <button
          className="btn btn-primary spin-remote"
          disabled={state.spinRequested}
          onClick={() => post('/spin/request', { playerId })}
        >
          {state.spinRequested ? '🎡 pörög a TV-n…' : '🎡 PÖRGESD MEG!'}
        </button>
      )}

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

      <BingoCard cells={cells} onToggle={toggle} />

      <div className="pfooter">
        <span className="hint">{marks}/24 jelölve · koppints a kockára, ha kiszúrtad</span>
        {offline && <span className="offline-note">⚠️ újracsatlakozás…</span>}
      </div>
    </div>
  )
}
