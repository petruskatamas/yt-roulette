import { bestLineProgress, hasBingo } from '@/data/challenges'
import type { Messages } from '@/lib/i18n'
import type { GamePlayer } from '@/types'

const DANGER_LINE = 4

type Props = {
  players: GamePlayer[]
  currentIndex: number
  t: Messages
  onInspect: (playerId: string) => void
}

export function PlayerList({ players, currentIndex, t, onInspect }: Props) {
  return (
    <div className="panel tv-players">
      <h2 className="panel-title">{t.host.players}</h2>
      <div className="status-list">
        {players.map((player, i) => {
          const cells = player.cells
          const marks = cells?.filter((c) => c.marked && !c.free).length ?? 0
          const bingo = cells ? hasBingo(cells) : false
          const best = !bingo && cells ? bestLineProgress(cells) : 0

          return (
            <button
              key={player.id}
              className={`status-item ${bingo ? 'has-bingo' : ''}`}
              onClick={() => onInspect(player.id)}
            >
              <span className="status-turn">{i === currentIndex ? '🎯' : ''}</span>
              <span className="status-dot" style={{ background: player.color }} />
              <span className="status-name">
                {player.name}
                {player.wins > 0 && <span className="status-wins"> 🏆{player.wins}</span>}
              </span>
              {best >= DANGER_LINE && <span className="status-danger">🔥 {best}/5</span>}
              <span className="status-info">
                {bingo ? t.host.bingo : cells ? t.host.marked(marks) : t.host.writingCard}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
