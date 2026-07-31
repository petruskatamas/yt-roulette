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

export type YtResult = {
  id: string
  title: string
  channel: string
  channelId: string
  published: string // relative text as shown on YouTube, e.g. "13 évvel ezelőtt"
  thumb: string
  views: number // -1 = unknown
  duration: string // "1:23"
}

export type YtVideoDetails = {
  likes: string // as shown; YouTube abbreviates ("19 M"), '' = hidden
  commentsDisabled: boolean
  uploaded: string // exact date as shown, e.g. "2013. jan. 4."
  description: string
}

export type YtChannel = {
  id: string
  name: string
  avatar: string
  subscribers: string // as shown, e.g. "3 feliratkozó"
  videoCount: string // as shown, e.g. "12 videó"
  description: string
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
  lastSpin: Spin | null
  celebration: { name: string; ts: number } | null
  spinRequested: boolean // current player asked the TV to spin
  roundWonBy: string | null // player id of this round's first bingo
  marks: MarkEvent[]
  version: number
}
