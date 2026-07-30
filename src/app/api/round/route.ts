import { bump, getState, ok, readBody } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const redeal = body.redeal === true
  const state = getState()
  for (const player of state.players) {
    if (redeal) {
      player.cells = null
    } else if (player.cells) {
      player.cells = player.cells.map((c) => ({ ...c, marked: !!c.free }))
    }
  }
  state.celebration = null
  state.roundWonBy = null
  state.spinRequested = false
  state.marks = []
  bump()
  return ok()
}
