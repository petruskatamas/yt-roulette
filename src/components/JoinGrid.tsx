import { useJoinBase } from '@/lib/gameClient'
import type { Messages } from '@/lib/i18n'
import type { GamePlayer } from '@/types'
import { QR } from '@/components/QR'

export function JoinGrid({ players, t }: { players: GamePlayer[]; t: Messages }) {
  const joinBase = useJoinBase()
  if (players.length === 0) return null

  return (
    <div className="join-section">
      {joinBase?.includes('localhost') && <p className="hint">{t.join.noLan}</p>}
      <div className="join-grid">
        {players.map((player) => {
          const url = `${joinBase ?? ''}/#/p/${player.id}`
          return (
            <div key={player.id} className="join-card">
              <div className="join-name" style={{ color: player.color }}>
                {player.name} {player.cells ? '✅' : '✍️'}
              </div>
              {joinBase && <QR text={url} />}
              <div className="join-url">{url}</div>
            </div>
          )
        })}
      </div>
      <p className="hint">{t.join.scanHint}</p>
    </div>
  )
}
