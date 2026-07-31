import type { RelTime } from '../types'

// YouTube is always asked in en-US so there is exactly one language to parse;
// clients localize the structured numbers/dates we return.
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
  // skips the EU consent interstitial for cookieless server-side fetches
  Cookie: 'SOCS=CAI; CONSENT=YES+cb.20220301-11-p0.en+FX+700; PREF=hl=en&gl=US',
}

const MARKER = 'var ytInitialData = '

export async function fetchInitialData(url: URL | string): Promise<unknown | null> {
  const res = await fetch(url, { cache: 'no-store', headers: HEADERS })
  if (!res.ok) return null
  const html = await res.text()
  const start = html.indexOf(MARKER)
  const end = start < 0 ? -1 : html.indexOf(';</script>', start)
  if (start < 0 || end < 0) return null
  try {
    return JSON.parse(html.slice(start + MARKER.length, end))
  } catch {
    return null
  }
}

/** Depth-first collect of every value stored under `key`, wherever it is nested. */
export function collect<T>(node: unknown, key: string, out: T[] = []): T[] {
  if (Array.isArray(node)) {
    for (const item of node) collect(item, key, out)
  } else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (k === key && v && typeof v === 'object') out.push(v as T)
      else collect(v, key, out)
    }
  }
  return out
}

const SUFFIX: Record<string, number> = { K: 1e3, M: 1e6, B: 1e9 }

/**
 * en-US counts: "1,234" exact, "1.2K"/"19M" abbreviated, "No views" zero.
 * Returns null when the number is absent or hidden.
 */
export function parseCount(text: string): { value: number | null; approx: boolean; text: string } {
  const raw = (text ?? '').trim()
  if (!raw) return { value: null, approx: false, text: '' }
  if (/^no\b/i.test(raw)) return { value: 0, approx: false, text: raw }

  const abbr = /([\d.,]+)\s*([KMB])\b/i.exec(raw)
  if (abbr) {
    const n = Number(abbr[1].replace(/,/g, ''))
    const mult = SUFFIX[abbr[2].toUpperCase()]
    if (Number.isFinite(n)) {
      return { value: Math.round(n * mult), approx: true, text: `${abbr[1]}${abbr[2].toUpperCase()}` }
    }
  }

  const digits = raw.replace(/[^\d]/g, '')
  if (!digits) return { value: null, approx: false, text: raw }
  return { value: Number(digits), approx: false, text: digits }
}

const UNITS: RelTime extends { unit: infer U } | null ? Record<string, U> : never = {
  second: 'second', seconds: 'second',
  minute: 'minute', minutes: 'minute',
  hour: 'hour', hours: 'hour',
  day: 'day', days: 'day',
  week: 'week', weeks: 'week',
  month: 'month', months: 'month',
  year: 'year', years: 'year',
}

/** "13 years ago" / "Streamed 2 months ago" → {value: 13, unit: 'year'} */
export function parseRelative(text: string): RelTime {
  const m = /(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i.exec(text ?? '')
  if (!m) return null
  const unit = UNITS[m[2].toLowerCase()]
  return unit ? { value: Number(m[1]), unit } : null
}

/** "Premiered Jan 4, 2013" / "Jan 4, 2013" → "2013-01-04" */
export function parseDate(text: string): string {
  const m = /([A-Z][a-z]{2})\s+(\d{1,2}),\s*(\d{4})/.exec(text ?? '')
  if (!m) return ''
  const d = new Date(`${m[1]} ${m[2]}, ${m[3]} UTC`)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}
