import { blankState, getState, setState } from '@/server/state'
import { ok } from '@/server/http'

export async function POST() {
  const prev = getState()
  const next = blankState()
  next.version = prev.version + 1
  next.locale = prev.locale // the room's language and mode outlive a single game
  next.voteMode = prev.voteMode
  setState(next)
  return ok()
}
