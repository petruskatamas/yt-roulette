import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameState } from '../types'

export function useGame(intervalMs = 1000) {
  const [state, setState] = useState<GameState | null>(null)
  const [offline, setOffline] = useState(false)
  const versionRef = useRef(0)

  const refresh = useCallback(async (force = false) => {
    try {
      const res = await fetch(`/api/state?v=${force ? 0 : versionRef.current}`)
      const data = await res.json()
      setOffline(false)
      if (!data.unchanged) {
        versionRef.current = data.version
        setState(data)
      }
    } catch {
      setOffline(true)
    }
  }, [])

  useEffect(() => {
    refresh(true)
    const timer = setInterval(() => refresh(), intervalMs)
    return () => clearInterval(timer)
  }, [refresh, intervalMs])

  const post = useCallback(
    async (path: string, body?: unknown) => {
      try {
        await fetch(`/api${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
      } catch {
        /* next poll will resync */
      }
      await refresh(true)
    },
    [refresh],
  )

  return { state, post, offline }
}

export function useWakeLock() {
  useEffect(() => {
    if (!('wakeLock' in navigator)) return
    let sentinel: WakeLockSentinel | null = null
    const acquire = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => {
          sentinel = s
        })
        .catch(() => {})
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') acquire()
    }
    acquire()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      sentinel?.release().catch(() => {})
    }
  }, [])
}

export function openOnTv(url: string) {
  fetch('/api/open', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  }).catch(() => {})
}

export function useJoinBase() {
  const [joinBase, setJoinBase] = useState<string | null>(null)
  useEffect(() => {
    fetch('/api/info')
      .then((r) => r.json())
      .then((d) => setJoinBase(d.joinBase))
      .catch(() => {})
  }, [])
  return joinBase
}
