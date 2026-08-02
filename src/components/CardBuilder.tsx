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
import { challengesFor } from '@/data/challenges'
import { CARD_SQUARES, loadDraft, saveDraft } from '@/lib/cardDraft'
import type { Messages } from '@/lib/i18n'
import type { GamePlayer, Locale } from '@/types'

const GRID_CELLS = 25
const FREE_CELL = 12
// Below this a press is a tap (opens the editor); beyond it, a drag.
const DRAG_THRESHOLD_PX = 8

const toSquare = (cell: number) => (cell < FREE_CELL ? cell : cell - 1)

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

  return (
    <button
      ref={(el) => {
        drag.setNodeRef(el)
        drop.setNodeRef(el)
      }}
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

type Props = {
  player: GamePlayer
  locale: Locale | undefined
  t: Messages
  onSubmit: (texts: string[]) => void
}

export function CardBuilder({ player, locale, t, onSubmit }: Props) {
  const [texts, setTexts] = useState<string[]>(
    () => (player.draft?.length === CARD_SQUARES ? player.draft : loadDraft(player.id)),
  )
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const [dragging, setDragging] = useState<number | null>(null)
  const suppressClick = useRef(false)

  const pool = challengesFor(locale)
  const placeholders = useMemo(
    () => [...pool].sort(() => Math.random() - 0.5).slice(0, CARD_SQUARES),
    [pool],
  )
  const filled = texts.filter((text) => text.trim()).length
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: DRAG_THRESHOLD_PX } }),
  )

  useEffect(() => saveDraft(player.id, texts), [texts, player.id])

  const setAt = (index: number, value: string) =>
    setTexts((all) => all.map((text, i) => (i === index ? value : text)))

  const swap = (a: number, b: number) =>
    setTexts((all) => {
      const next = [...all]
      ;[next[a], next[b]] = [next[b], next[a]]
      return next
    })

  const unused = () => {
    const taken = new Set(texts.map((text) => text.trim().toLowerCase()).filter(Boolean))
    return pool.filter((suggestion) => !taken.has(suggestion.toLowerCase()))
  }

  const fillBlanks = () => {
    const suggestions = unused().sort(() => Math.random() - 0.5)
    setTexts((all) => all.map((text) => (text.trim() ? text : suggestions.pop() ?? text)))
  }

  // the browser fires a click after a drag; swallow that one
  const releaseClickGuard = () => setTimeout(() => (suppressClick.current = false), 0)

  const onDragStart = (event: DragStartEvent) => {
    suppressClick.current = true
    setDragging(Number(event.active.id))
  }

  const onDragEnd = (event: DragEndEvent) => {
    setDragging(null)
    releaseClickGuard()
    if (event.over != null && event.over.id !== event.active.id) {
      swap(Number(event.active.id), Number(event.over.id))
    }
  }

  const closeEditor = (value?: string) => {
    if (editing != null && value !== undefined) setAt(editing, value)
    setEditing(null)
  }

  return (
    <div className="player-screen">
      <header className="pheader">
        <div className="pname" style={{ color: player.color }}>
          ✍️ {player.name}
        </div>
        <div className="hint">{t.player.writeCard}</div>
      </header>

      <p className="builder-intro">{t.player.builderIntro}</p>

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => {
          setDragging(null)
          releaseClickGuard()
        }}
      >
        <div className="eb-grid">
          {Array.from({ length: GRID_CELLS }, (_, cell) =>
            cell === FREE_CELL ? (
              <div key={cell} className="eb-cell eb-free">
                ☠️
              </div>
            ) : (
              <BuilderCell
                key={cell}
                index={toSquare(cell)}
                text={texts[toSquare(cell)].trim()}
                onTap={(index) => {
                  setEditing(index)
                  setDraft(texts[index])
                }}
                suppressClick={suppressClick}
              />
            ),
          )}
        </div>
        <DragOverlay>
          {dragging != null && (
            <div className="eb-cell is-filled eb-overlay">{texts[dragging].trim() || '+'}</div>
          )}
        </DragOverlay>
      </DndContext>

      <div className="builder-footer">
        <div className="builder-count">
          {filled}/{CARD_SQUARES}
        </div>
        <button className="btn" onClick={fillBlanks} disabled={filled === CARD_SQUARES}>
          {t.player.fill}
        </button>
        <button
          className="btn btn-primary"
          onClick={() => onSubmit(texts.map((text) => text.trim()))}
          disabled={filled < CARD_SQUARES}
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
              onKeyDown={(e) => e.key === 'Enter' && closeEditor(draft.trim())}
              placeholder={t.player.editPlaceholder(placeholders[editing])}
              maxLength={60}
            />
            <div className="editor-actions">
              <button
                className="btn"
                onClick={() => {
                  const suggestions = unused()
                  if (suggestions.length) {
                    setDraft(suggestions[Math.floor(Math.random() * suggestions.length)])
                  }
                }}
              >
                🎲
              </button>
              {texts[editing].trim() !== '' && (
                <button className="btn" onClick={() => closeEditor('')}>
                  {t.player.delete}
                </button>
              )}
              <button className="btn btn-primary" onClick={() => closeEditor(draft.trim())}>
                {t.player.save}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
