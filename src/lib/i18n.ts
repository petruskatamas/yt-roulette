import { en } from '@/messages/en'
import { es } from '@/messages/es'
import { fr } from '@/messages/fr'
import { hu } from '@/messages/hu'
import type { Locale, RelTime } from '@/types'

// English is the source of truth: every other locale must satisfy this shape.
export type Messages = typeof en

const ALL: Record<Locale, Messages> = { en, es, fr, hu }

export const LOCALES: Locale[] = ['en', 'es', 'fr', 'hu']

export const messages = (locale: Locale | undefined): Messages => ALL[locale ?? 'en'] ?? en

export const localeOptions = LOCALES.map((id) => ({
  id,
  label: `${ALL[id].flag} ${ALL[id].nativeName}`,
}))

// "2013-01-04" → locale-formatted date; passes through anything unparseable
export function fmtDate(iso: string, t: Messages): string {
  const d = new Date(iso)
  if (!iso || Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(t.bcp47, { dateStyle: 'medium' }).format(d)
}

export function fmtRelative(rel: RelTime, t: Messages): string {
  if (!rel) return ''
  return new Intl.RelativeTimeFormat(t.bcp47, { numeric: 'auto' }).format(-rel.value, rel.unit)
}

export const fmtViews = (views: number, t: Messages) =>
  views < 0 ? t.watch.unknownViews : views === 0 ? t.watch.zeroViews : t.watch.views(views)
