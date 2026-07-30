import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { networkInterfaces } from 'node:os'
import { join } from 'node:path'
import type { GameState } from '../types'

const DATA_DIR = join(process.cwd(), '.game')
const DATA_FILE = join(DATA_DIR, 'state.json')

export function blankState(): GameState {
  return {
    phase: 'setup',
    players: [],
    current: 0,
    history: [],
    lastSpin: null,
    celebration: null,
    version: 1,
  }
}

function loadState(): GameState {
  try {
    const s = JSON.parse(readFileSync(DATA_FILE, 'utf8')) as GameState
    if (!Array.isArray(s.players) || typeof s.version !== 'number') return blankState()
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
