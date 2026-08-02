import { buildCard, bump, cardTexts, getState, ok, readBody, shuffled } from '@/server/game'

const MODES = ['keep', 'shuffle', 'rewrite', 'new'] as const
type Mode = (typeof MODES)[number]

export async function POST(req: Request) {
  const body = await readBody(req)
  const mode: Mode = MODES.includes(body.mode as Mode) ? (body.mode as Mode) : 'keep'
  const state = getState()

  if (mode === 'shuffle') {
    // every card goes back in the pot and is dealt out at random
    const holders = state.players.filter((p) => p.cells)
    const pot = shuffled(holders.map((p) => cardTexts(p.cells!)))
    holders.forEach((player, i) => {
      player.cells = buildCard(pot[i])
      player.draft = null
    })
  } else {
    for (const player of state.players) {
      const texts = player.cells ? cardTexts(player.cells) : player.draft
      if (mode === 'new') {
        player.cells = null
        player.draft = null
      } else if (mode === 'rewrite') {
        player.cells = null
        player.draft = texts // the editor opens pre-filled with what they had
      } else if (player.cells) {
        player.cells = player.cells.map((c) => ({ ...c, marked: !!c.free }))
      }
    }
  }

  state.celebration = null
  state.roundWonBy = null
  state.spinRequested = false
  state.searchOpen = false
  state.claims = []
  state.lastVote = null
  state.lastVerdict = null
  state.nowPlaying = null
  state.marks = []
  bump()
  return ok()
}
