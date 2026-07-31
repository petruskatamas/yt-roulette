import { winningCells } from '../data/challenges'
import type { Messages } from '../lib/i18n'
import type { Cell } from '../types'

type Props = {
  cells: Cell[]
  t: Messages
  onToggle?: (index: number) => void
  readOnly?: boolean
}

export function BingoCard({ cells, t, onToggle, readOnly }: Props) {
  const won = winningCells(cells)
  return (
    <div className="bingo-grid">
      {cells.map((cell, i) => (
        <button
          key={i}
          className={[
            'bingo-cell',
            cell.marked ? 'is-marked' : '',
            cell.free ? 'is-free' : '',
            won.has(i) ? 'is-winning' : '',
            readOnly ? 'is-readonly' : '',
          ].join(' ')}
          onClick={() => !readOnly && !cell.free && onToggle?.(i)}
          title={cell.free ? t.card.freeTitle : cell.text}
        >
          {cell.free ? '☠️' : cell.text}
        </button>
      ))}
    </div>
  )
}
