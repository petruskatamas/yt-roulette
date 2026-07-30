'use client'

import { useEffect, useState } from 'react'
import { HostView } from '@/views/HostView'
import { PlayerView } from '@/views/PlayerView'

export default function Page() {
  // hash exists only in the browser; render nothing until mounted
  const [hash, setHash] = useState<string | null>(null)

  useEffect(() => {
    const onHash = () => setHash(window.location.hash)
    onHash()
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (hash === null) return null

  const playerMatch = /^#\/p\/([\w-]+)/.exec(hash)
  return playerMatch ? <PlayerView playerId={playerMatch[1]} /> : <HostView />
}
