export type Cell = {
  text: string
  marked: boolean
  free?: boolean
}

export type SortMode = 'date' | 'none'

export type SpinQuery = {
  query: string
  sort: SortMode
  map: string
  tip: string
}

export type Segment = {
  id: string
  label: string
  emoji: string
  color: string
  gen: () => SpinQuery
}

export type Gen = () => { query: string; sort?: SortMode; map?: string }

export type SegDef = {
  id: string
  label: string
  emoji: string
  pool: Gen[]
  map: string
  tip: string
}

export type SimpleDate = { y: number; m: number; d: number }

export type Spin = SpinQuery & {
  player: string
  segmentId: string
  segmentLabel: string
  emoji: string
}

export type GamePlayer = {
  id: string
  name: string
  color: string
  wins: number
  cells: Cell[] | null // null until the player submits their card
}

export type MarkEvent = {
  player: string
  color: string
  text: string
  ts: number
}

export type GameState = {
  phase: 'setup' | 'play'
  players: GamePlayer[]
  current: number
  history: Spin[]
  lastSpin: Spin | null
  celebration: { name: string; ts: number } | null
  spinRequested: boolean // current player asked the TV to spin
  roundWonBy: string | null // player id of this round's first bingo
  marks: MarkEvent[]
  version: number
}
