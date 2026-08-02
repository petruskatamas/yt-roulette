import { bad, buildCard, bump, getState, ok, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const player = getState().players.find((p) => p.id === body.playerId)
  const texts = Array.isArray(body.texts)
    ? (body.texts as unknown[]).map((t) => String(t).trim()).filter(Boolean)
    : []
  if (!player) return bad(404, 'player not found')
  if (texts.length !== 24) return bad(400, 'need exactly 24 squares')
  player.cells = buildCard(texts)
  player.draft = null
  bump()
  return ok()
}
