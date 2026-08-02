import { useState } from 'react'
import { openOnTv } from '@/lib/gameClient'
import type { Messages } from '@/lib/i18n'
import { SEGMENTS, ytUrl } from '@/data/patterns'
import type { Spin } from '@/types'

type Props = {
  spin: Spin | null
  t: Messages
  onSearch: () => void
}

export function SpinPanel({ spin, t, onSearch }: Props) {
  const [copied, setCopied] = useState(false)

  if (!spin) {
    return (
      <div className="panel tv-spin">
        <p className="spin-placeholder">{t.host.spinPrompt}</p>
      </div>
    )
  }

  const segment = SEGMENTS.find((s) => s.id === spin.segmentId)
  const text = t.segments[spin.segmentId as keyof typeof t.segments]

  const copyQuery = async () => {
    try {
      await navigator.clipboard.writeText(spin.query)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="panel tv-spin">
      <div className="spin-result" key={`${spin.player}-${spin.query}`}>
        <div className="spin-meta">
          <span className="spin-seg">
            {segment?.emoji} {text?.label}
          </span>
          <span className="spin-player">{t.host.spunBy(spin.player)}</span>
        </div>

        <button className="spin-query" onClick={copyQuery} title={t.host.copyTitle}>
          {spin.query}
          <span className="copy-hint">{copied ? t.host.copied : '⧉'}</span>
        </button>

        <div className="spin-actions">
          <button className="btn btn-primary" onClick={onSearch}>
            {t.host.search}
          </button>
          <button className="btn btn-ghost" onClick={() => openOnTv(ytUrl(spin.query, spin.sort))}>
            {t.common.inBrowser}
          </button>
        </div>

        {spin.sort === 'date' && <div className="spin-note">{t.host.sortedByDate}</div>}
        <p className="spin-tip">{text?.tip}</p>
      </div>
    </div>
  )
}
