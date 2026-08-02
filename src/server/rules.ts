import { hasBingo } from '@/data/challenges'
import type { Cell, GamePlayer, GameState } from '@/types'

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

// Marks a cell for real: records the toast and awards the round if it completes a line.
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

// Resolves a claim once every eligible voter has voted (or when the host forces it).
// A tie goes to the claimant. Returns false while the vote is still open.
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
