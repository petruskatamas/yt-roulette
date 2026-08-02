import { bump, getState } from '@/server/state'
import { bad, ok, readBody } from '@/server/http'
import { LOCALES } from '@/lib/i18n'
import type { Locale } from '@/types'

export async function POST(req: Request) {
  const body = await readBody(req)
  const locale = String(body.locale ?? '') as Locale
  if (!LOCALES.includes(locale)) return bad(400, 'unknown locale')
  getState().locale = locale
  bump()
  return ok()
}
