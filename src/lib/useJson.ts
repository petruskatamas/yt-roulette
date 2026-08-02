import { useEffect, useState } from 'react'

// Fetches JSON whenever `url` changes, ignoring responses that arrive after the
// url moved on. `null` url means "nothing to load".
export function useJson<T>(url: string | null): { data: T | null; failed: boolean } {
  const [data, setData] = useState<T | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setData(null)
    setFailed(false)
    if (!url) return

    let cancelled = false
    fetch(url)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((body) => !cancelled && setData(body as T))
      .catch(() => !cancelled && setFailed(true))
    return () => {
      cancelled = true
    }
  }, [url])

  return { data, failed }
}
