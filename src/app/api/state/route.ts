import { getState } from '@/server/game'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const v = Number(new URL(req.url).searchParams.get('v') ?? 0)
  const state = getState()
  if (v === state.version) return Response.json({ unchanged: true, version: v })
  return Response.json(state)
}
