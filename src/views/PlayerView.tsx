'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
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
import { challengesFor, hasBingo } from '../data/challenges'
import { messages } from '../lib/i18n'
import type { Messages } from '../lib/i18n'
import { buzz, initSoundUnlock, pop, voteBlip } from '../lib/sound'
import type { GamePlayer, Locale } from '../types'
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
  suppressClick: RefObject<boolean>
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
  locale,
  t,
  onSubmit,
}: {
  player: GamePlayer
  locale: Locale | undefined
  t: Messages
  onSubmit: (texts: string[]) => void
}) {
  const [texts, setTexts] = useState<string[]>(
    () => (player.draft?.length === 24 ? player.draft : loadDraft(player.id)),
  )
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [activeId, setActiveId] = useState<number | null>(null)
  const suppressClick = useRef(false)
  const pool = challengesFor(locale)
  const placeholders = useMemo(
    () => [...pool].sort(() => Math.random() - 0.5).slice(0, 24),
    [pool],
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
    const used = new Set(texts.map((x) => x.trim().toLowerCase()).filter(Boolean))
    return pool.filter((c) => !used.has(c.toLowerCase()))
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
        <div className="pname" style={{ color: player.color }}>✍️ {player.name}</div>
        <div className="hint">{t.player.writeCard}</div>
      </header>

      <p className="builder-intro">{t.player.builderIntro}</p>

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
          {t.player.fill}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit(texts.map((t) => t.trim()))}
          disabled={filled < 24}
        >
          {t.player.submit}
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
              placeholder={t.player.editPlaceholder(placeholders[editing])}
              maxLength={60}
            />
            <div className="editor-actions">
              <button className="btn" onClick={randomIntoEdit}>🎲</button>
              {texts[editing].trim() !== '' && (
                <button className="btn" onClick={clearEdit}>{t.player.delete}</button>
              )}
              <button className="btn btn-primary" onClick={saveEdit}>{t.player.save}</button>
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

  const t = messages(state?.locale)
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
        {offline ? t.player.cantReach : t.common.connecting}
      </div>
    )
  }

  if (!me) {
    return (
      <div className="center-note">{t.player.notInGame}</div>
    )
  }

  if (!me.cells) {
    return (
      <CardBuilder
        player={me}
        locale={state.locale}
        t={t}
        onSubmit={(texts) => post('/card', { playerId, texts })}
      />
    )
  }

  const cells = me.cells
  const myClaims = new Set(
    state.claims.filter((c) => c.playerId === me.id).map((c) => c.cellIndex),
  )
  const claim = state.claims[0]
  const canMark = !!state.nowPlaying
  const iAmClaimant = claim?.playerId === me.id
  const myVote = claim && !iAmClaimant ? claim.votes[me.id] : undefined
  const spinner = state.players[state.current]
  const myTurn = spinner?.id === me.id
  const iWon = hasBingo(cells)

  const toggle = (i: number) => {
    if (!cells[i].marked) {
      pop()
      buzz(40)
    }
    post('/toggle', { playerId, index: i })
  }

  return (
    <div className="player-screen pview">
      <div className="pcenter">
      <header className="pheader">
        <div className="pname" style={{ color: me.color }}>
          {me.name}
          {me.wins > 0 && <span className="pwins"> 🏆{me.wins}</span>}
        </div>
      </header>

      {claim && (
        <div className="vote-panel">
          <div className="vote-claim">
            <span style={{ color: claim.color }}>{t.vote.claimedBy(claim.playerName)}</span>
            <div className="vote-text">„{claim.text}”</div>
          </div>
          {iAmClaimant ? (
            <div className="hint">{t.vote.yourClaim}</div>
          ) : myVote !== undefined ? (
            <div className="hint">{t.vote.voted}</div>
          ) : (
            <div className="vote-actions">
              <button
                className="btn btn-primary vote-yes"
                onClick={() => {
                  voteBlip(2)
                  buzz(30)
                  post('/vote', { playerId, claimId: claim.id, valid: true })
                }}
              >
                {t.vote.valid}
              </button>
              <button
                className="btn vote-no"
                onClick={() => {
                  voteBlip(0)
                  buzz(30)
                  post('/vote', { playerId, claimId: claim.id, valid: false })
                }}
              >
                {t.vote.invalid}
              </button>
            </div>
          )}
        </div>
      )}

      {state.phase === 'play' && myTurn && !claim && (
        <button
          className="btn btn-primary spin-remote"
          disabled={state.spinRequested || state.searchOpen || state.claims.length > 0}
          onClick={() => post('/spin/request', { playerId })}
        >
          {state.claims.length > 0
            ? t.vote.spinBlocked
            : state.searchOpen
            ? t.player.tvBusy
            : state.spinRequested
              ? t.player.spinning
              : t.player.spin}
        </button>
      )}

      {state.celebration && (
        <div className="mini-celebration">
          {t.player.bingoBanner(state.celebration.name)}
        </div>
      )}

      {iWon && !state.celebration && (
        <div className="mini-celebration">🏆 BINGÓ 🏆</div>
      )}

      <BingoCard cells={cells} onToggle={toggle} t={t} pending={myClaims} locked={!canMark} />

      {offline && (
        <div className="pfooter">
          <span className="offline-note">{t.player.reconnecting}</span>
        </div>
      )}
      </div>
    </div>
  )
}
