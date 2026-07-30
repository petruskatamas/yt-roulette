import { bad, bump, getState, readBody, uid } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const name = String(body.name ?? '').trim().slice(0, 20)
  if (!name) return bad(400, 'name required')
  const player = { id: uid(), name, cells: null }
  getState().players.push(player)
  bump()
  return Response.json({ id: player.id })
}
