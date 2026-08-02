import type { Cell, Locale } from '@/types'
import { en } from './challenges/en'
import { es } from './challenges/es'
import { fr } from './challenges/fr'
import { hu } from './challenges/hu'

const LISTS: Record<Locale, string[]> = { en, es, fr, hu }

// Suggestions offered while writing a card; not the card itself.
export const challengesFor = (locale: Locale | undefined): string[] => LISTS[locale ?? 'en'] ?? en

const LINES: number[][] = [
  // rows
  [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
  [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
  // columns
  [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22],
  [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
  // diagonals
  [0, 6, 12, 18, 24], [4, 8, 12, 16, 20],
]

// Indices of every cell that is part of a completed line
export function winningCells(cells: Cell[]): Set<number> {
  const won = new Set<number>()
  for (const line of LINES) {
    if (line.every((i) => cells[i]?.marked)) line.forEach((i) => won.add(i))
  }
  return won
}

export const hasBingo = (cells: Cell[]) => winningCells(cells).size > 0

// Marked-cell count of the player's most complete line (0–5)
export function bestLineProgress(cells: Cell[]): number {
  let best = 0
  for (const line of LINES) {
    const n = line.filter((i) => cells[i]?.marked).length
    if (n > best) best = n
  }
  return best
}
