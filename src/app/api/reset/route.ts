import { blankState, getState, ok, setState } from '@/server/game'

export async function POST() {
  const next = blankState()
  next.version = getState().version + 1
  setState(next)
  return ok()
}
