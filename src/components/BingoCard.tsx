import type { Cell } from '../types'
import { winningCells } from '../data/challenges'

type Props = {
  cells: Cell[]
  onToggle?: (index: number) => void
  readOnly?: boolean
}

export function BingoCard({ cells, onToggle, readOnly }: Props) {
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
          title={cell.free ? 'Ingyen kocka' : cell.text}
        >
          {cell.free ? '☠️' : cell.text}
        </button>
      ))}
    </div>
  )
}
