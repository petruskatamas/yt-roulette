import { bump, getState } from '@/server/state'
import { ok, readBody } from '@/server/http'

export async function POST(req: Request) {
  const body = await readBody(req)
  const open = body.open === true
  const video = body.video as { title?: string; thumb?: string } | null | undefined
  const playing = video ? { title: String(video.title ?? ''), thumb: String(video.thumb ?? '') } : null

  const state = getState()
  if (state.searchOpen !== open || (state.nowPlaying?.title ?? null) !== (playing?.title ?? null)) {
    state.searchOpen = open
    state.nowPlaying = playing
    bump()
  }
  return ok()
}
