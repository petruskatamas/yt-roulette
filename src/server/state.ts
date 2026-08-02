import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { GameState } from '@/types'

const DATA_DIR = join(process.cwd(), '.game')
const DATA_FILE = join(DATA_DIR, 'state.json')

export const PLAYER_COLORS = [
  '#ff595e', '#ffca3a', '#8ac926', '#1982c4',
  '#f15bb5', '#ff924c', '#52e3c2', '#6a8ff2',
]

export const uid = () => Math.random().toString(36).slice(2, 10)

export function blankState(): GameState {
  return {
    phase: 'setup',
    locale: 'en',
    players: [],
    current: 0,
    lastSpin: null,
    celebration: null,
    spinRequested: false,
    searchOpen: false,
    voteMode: false,
    claims: [],
    lastVote: null,
    lastVerdict: null,
    nowPlaying: null,
    roundWonBy: null,
    marks: [],
    version: 1,
  }
}

// Fills in anything a state file written by an older build is missing.
function migrate(s: GameState): GameState {
  s.locale ??= 'en'
  s.spinRequested ??= false
  s.searchOpen ??= false
  s.voteMode ??= false
  s.lastVote ??= null
  s.lastVerdict ??= null
  s.nowPlaying ??= null
  s.roundWonBy ??= null
  if (!Array.isArray(s.claims)) s.claims = []
  if (!Array.isArray(s.marks)) s.marks = []
  s.marks.forEach((m) => (m.color ??= '#35d189'))
  s.players.forEach((p, i) => {
    p.wins ??= 0
    p.draft ??= null
    p.color ??= PLAYER_COLORS[i % PLAYER_COLORS.length]
  })
  return s
}

function loadState(): GameState {
  try {
    const parsed = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as GameState
    if (!Array.isArray(parsed.players) || typeof parsed.version !== 'number') return blankState()
    return migrate(parsed)
  } catch {
    return blankState()
  }
}

// module scope is re-created on hot reload, so the live game hangs off globalThis
const globals = globalThis as typeof globalThis & { __ytRouletteState?: GameState }

export function getState(): GameState {
  globals.__ytRouletteState ??= loadState()
  return globals.__ytRouletteState
}

export function setState(next: GameState) {
  globals.__ytRouletteState = next
  save()
}

function save() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(getState()))
  } catch {
    // persistence is best-effort
  }
}

// Call after every mutation: pollers refetch when the version changes.
export function bump() {
  getState().version++
  save()
}
