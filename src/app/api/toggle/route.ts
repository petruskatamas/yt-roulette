import { applyMark, bad, bump, getState, ok, readBody, resolveClaim, uid } from '@/server/game'

export async function POST(req: Request) {
  const body = await readBody(req)
  const state = getState()
  const player = state.players.find((p) => p.id === body.playerId)
  const index = Number(body.index)
  const cell = player?.cells?.[index]
  if (!player?.cells || !cell || cell.free) return bad(400, 'bad toggle')

  const retracting =
    cell.marked ||
    state.claims.some((c) => c.playerId === player.id && c.cellIndex === index)
  if (!retracting && !state.nowPlaying) return bad(409, 'no video playing')

  if (state.voteMode && !cell.marked) {
    const existing = state.claims.find((c) => c.playerId === player.id && c.cellIndex === index)
    if (existing) {
      state.claims = state.claims.filter((c) => c !== existing) // tap again to retract
    } else {
      const claim = {
        id: uid(),
        playerId: player.id,
        playerName: player.name,
        color: player.color,
        cellIndex: index,
        text: cell.text,
        videoTitle: state.nowPlaying?.title ?? '',
        thumb: state.nowPlaying?.thumb ?? '',
        votes: {},
      }
      state.claims.push(claim)
      if (state.players.length < 2) resolveClaim(state, claim.id, true) // nobody to judge
    }
    bump()
    return ok()
  }

  if (cell.marked) {
    cell.marked = false
    bump()
    return ok()
  }

  applyMark(state, player, index)
  bump()
  return ok()
}
