import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { join } from 'node:path'
import { hasBingo } from '../data/challenges'
import type { Cell, GamePlayer, GameState } from '../types'

const DATA_DIR = join(process.cwd(), '.game')
const DATA_FILE = join(DATA_DIR, 'state.json')

export const PLAYER_COLORS = [
  '#ff595e', '#ffca3a', '#8ac926', '#1982c4',
  '#f15bb5', '#ff924c', '#52e3c2', '#6a8ff2',
]

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

function loadState(): GameState {
  try {
    const s = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as GameState
    if (!Array.isArray(s.players) || typeof s.version !== 'number') return blankState()
    s.locale ??= 'en'
    s.spinRequested ??= false
    s.searchOpen ??= false
    s.voteMode ??= false
    s.lastVote ??= null
    s.lastVerdict ??= null
    s.nowPlaying ??= null
    if (!Array.isArray(s.claims)) s.claims = []
    s.roundWonBy ??= null
    if (!Array.isArray(s.marks)) s.marks = []
    s.marks.forEach((m) => { m.color ??= '#35d189' })
    delete (s as GameState & { history?: unknown }).history
    s.players.forEach((p, i) => {
      p.wins ??= 0
      p.draft ??= null
      p.color ??= PLAYER_COLORS[i % PLAYER_COLORS.length]
    })
    return s
  } catch {
    return blankState()
  }
}

const g = globalThis as typeof globalThis & { __ytRouletteState?: GameState }

export function getState(): GameState {
  g.__ytRouletteState ??= loadState()
  return g.__ytRouletteState
}

export function setState(next: GameState) {
  g.__ytRouletteState = next
  save()
}

function save() {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(DATA_FILE, JSON.stringify(getState()))
  } catch {
    /* persistence is best-effort */
  }
}

// call after every mutation: pollers refetch on version change
export function bump() {
  getState().version++
  save()
}

export const uid = () => Math.random().toString(36).slice(2, 10)

export const ok = () => Response.json({ ok: true })
export const bad = (status: number, error: string) => Response.json({ error }, { status })

export function lanIp(): string {
  for (const ifaces of Object.values(networkInterfaces())) {
    for (const iface of ifaces ?? []) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address
    }
  }
  return 'localhost'
}

export function openIncognito(url: string) {
  const run = (cmd: string, args: string[], fallback?: () => void) => {
    const started = Date.now()
    const child = spawn(cmd, args, { detached: true, stdio: 'ignore' })
    child.on('error', () => fallback?.())
    child.on('exit', (code) => {
      // only fall back on immediate failures, not on the browser closing later
      if (code !== 0 && Date.now() - started < 3000) fallback?.()
    })
    child.unref()
  }
  const openDefault = () =>
    run(
      process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open',
      [url],
    )
  if (process.platform === 'darwin') {
    run('open', ['-na', 'Google Chrome', '--args', '--incognito', url], openDefault)
  } else if (process.platform === 'win32') {
    run('cmd', ['/c', 'start', 'chrome', '--incognito', url], openDefault)
  } else {
    run('google-chrome', ['--incognito', url], openDefault)
  }
}

export async function readBody(req: Request): Promise<Record<string, unknown>> {
  try {
    const body = await req.json()
    return body && typeof body === 'object' ? (body as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}

/** Marks a cell for real: records the toast and awards the round if it completes a line. */
export function applyMark(state: GameState, player: GamePlayer, index: number) {
  const cell = player.cells?.[index]
  if (!player.cells || !cell || cell.free) return
  const hadBingo = hasBingo(player.cells)
  cell.marked = true
  state.marks = [
    { player: player.name, color: player.color, text: cell.text, ts: Date.now() },
    ...state.marks,
  ].slice(0, 6)
  if (!hadBingo && hasBingo(player.cells)) {
    state.celebration = { name: player.name, ts: Date.now() }
    if (!state.roundWonBy) {
      state.roundWonBy = player.id
      player.wins++
    }
  }
}

export const claimVoters = (state: GameState, claimantId: string) =>
  state.players.filter((p) => p.id !== claimantId)

/**
 * Resolves a claim once every eligible voter has voted (or when the host forces it).
 * A tie goes to the claimant. Returns false while the vote is still open.
 */
export function resolveClaim(state: GameState, claimId: string, force = false): boolean {
  const index = state.claims.findIndex((c) => c.id === claimId)
  if (index < 0) return false
  const claim = state.claims[index]
  const cast = Object.values(claim.votes)
  if (!force && cast.length < claimVoters(state, claim.playerId).length) return false

  const yes = cast.filter(Boolean).length
  const accepted = yes >= cast.length - yes
  state.claims.splice(index, 1)
  const player = state.players.find((p) => p.id === claim.playerId)
  if (accepted && player) applyMark(state, player, claim.cellIndex)
  state.lastVerdict = {
    playerName: claim.playerName,
    color: claim.color,
    text: claim.text,
    accepted,
    ts: Date.now(),
  }
  return true
}

/** The 24 written squares of a card, in order, without the free centre. */
export const cardTexts = (cells: Cell[]) => cells.filter((c) => !c.free).map((c) => c.text)

export function buildCard(texts: string[]): Cell[] {
  const cells: Cell[] = texts.map((text) => ({ text: text.slice(0, 60), marked: false }))
  cells.splice(12, 0, { text: 'FREE', marked: true, free: true })
  return cells
}

export function shuffled<T>(list: T[]): T[] {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

