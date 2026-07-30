import { bad, bump, getState, ok, readBody } from '@/server/game'
import { hasBingo } from '@/data/challenges'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const player = state.players.find((p) => p.id === body.playerId)
  const index = Number(body.index)
  const cell = player?.cells?.[index]
  if (!player?.cells || !cell || cell.free) return bad(400, 'bad toggle')
  const hadBingo = hasBingo(player.cells)
  cell.marked = !cell.marked
  if (!hadBingo && hasBingo(player.cells)) {
    state.celebration = { name: player.name, ts: Date.now() }
  }
  bump()
  return ok()
}
