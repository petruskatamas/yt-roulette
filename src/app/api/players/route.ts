import { PLAYER_COLORS, bump, getState, uid } from '@/server/state'
import { bad, json, readBody } from '@/server/http'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const name = String(body.name ?? '').trim().slice(0, 20)
  if (!name) return bad(400, 'name required')
  const player = {
    id: uid(),
    name,
    color: PLAYER_COLORS[state.players.length % PLAYER_COLORS.length],
    wins: 0,
    cells: null,
    draft: null,
  }
  state.players.push(player)
  bump()
  return json({ id: player.id })
}
