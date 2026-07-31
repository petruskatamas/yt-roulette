export type Locale = 'en' | 'hu'

export type Cell = {
  text: string
  marked: boolean
  free?: boolean
}

export type SortMode = 'date' | 'none'

export type SpinQuery = {
  query: string
  sort: SortMode
}

export type Segment = {
  id: string
  emoji: string
  color: string
  gen: () => SpinQuery
}

export type Gen = () => { query: string; sort?: SortMode }

export type SegDef = {
  id: string
  emoji: string
  pool: Gen[]
  sort?: SortMode
}

export type SimpleDate = { y: number; m: number; d: number }

export type RelTime = {
  value: number
  unit: 'year' | 'month' | 'week' | 'day' | 'hour' | 'minute' | 'second'
} | null

export type YtResult = {
  id: string
  title: string
  channel: string
  channelId: string
  published: RelTime
  thumb: string
  views: number // -1 = unknown
  duration: string // "1:23" — locale-neutral
}

export type YtChannel = {
  id: string
  name: string
  avatar: string
  subscribers: number | null // null = hidden by the uploader
  subscribersText: string // as shown when abbreviated, e.g. "1.2K"
  subscribersApprox: boolean
  videoCount: number | null
  description: string
}

export type YtVideoDetails = {
  likes: number | null // null = hidden
  likesText: string
  likesApprox: boolean
  commentsDisabled: boolean
  uploaded: string // ISO "2013-01-04", '' if unparseable
  description: string
}

export type Spin = SpinQuery & {
  player: string
  segmentId: string
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
  locale: Locale
  players: GamePlayer[]
  current: number
  lastSpin: Spin | null
  celebration: { name: string; ts: number } | null
  spinRequested: boolean // current player asked the TV to spin
  roundWonBy: string | null // player id of this round's first bingo
  marks: MarkEvent[]
  version: number
}
