import { bad, bump, getState, ok, readBody } from '@/server/game'
import type { Cell } from '@/types'

export async function POST(req: Request) {
  const body = await readBody(req)
  const player = getState().players.find((p) => p.id === body.playerId)
  const texts = Array.isArray(body.texts)
    ? (body.texts as unknown[]).map((t) => String(t).trim()).filter(Boolean)
    : []
  if (!player) return bad(404, 'player not found')
  if (texts.length !== 24) return bad(400, 'need exactly 24 squares')
  const cells: Cell[] = texts.map((text) => ({ text: text.slice(0, 60), marked: false }))
  cells.splice(12, 0, { text: 'FREE', marked: true, free: true })
  player.cells = cells
  bump()
  return ok()
}
