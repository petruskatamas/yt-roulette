const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept-Language': 'hu-HU,hu;q=0.9,en;q=0.8',
  // skips the EU consent interstitial for cookieless server-side fetches
  Cookie: 'SOCS=CAI; CONSENT=YES+cb.20220301-11-p0.en+FX+700; PREF=hl=hu&gl=HU',
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
