import { bump, getState, ok } from '@/server/game'

export async function POST() {
  getState().celebration = null
  bump()
  return ok()
}
