import { getState } from '@/server/state'
import { json } from '@/server/http'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const v = Number(new URL(req.url).searchParams.get('v') ?? 0)
  const state = getState()
  if (v === state.version) return json({ unchanged: true, version: v })
  return json(state)
}
