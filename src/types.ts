import type { Cell } from './data/challenges'
import type { SpinQuery } from './data/patterns'

export type Spin = SpinQuery & {
  player: string
  segmentId: string
  segmentLabel: string
  emoji: string
}

export type GamePlayer = {
  id: string
  name: string
  /** null until the player writes & submits their own card */
  cells: Cell[] | null
}

export type GameState = {
  phase: 'setup' | 'play'
  players: GamePlayer[]
  current: number
  history: Spin[]
  lastSpin: Spin | null
  celebration: { name: string; ts: number } | null
  version: number
}
