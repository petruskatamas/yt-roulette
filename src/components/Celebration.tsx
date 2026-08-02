import type { Messages } from '@/lib/i18n'
import type { GamePlayer } from '@/types'
import { BingoCard } from '@/components/BingoCard'

type Props = {
  winner: GamePlayer
  t: Messages
  onRound: (mode: 'keep' | 'shuffle') => void
  onConfirmRound: (mode: 'rewrite' | 'new') => void
  onNewGame: () => void
}

export function Celebration({ winner, t, onRound, onConfirmRound, onNewGame }: Props) {
  return (
    <div className="celebration">
      <div className="celebration-inner">
        <div className="celebration-confetti">🎉 🎰 🎉</div>
        <div className="celebration-title">{t.celebration.title}</div>
        <div className="celebration-name" style={{ color: winner.color }}>
          {winner.name}
        </div>

        {winner.cells && (
          <div className="celebration-card">
            <BingoCard cells={winner.cells} readOnly t={t} />
          </div>
        )}

        <div className="celebration-actions">
          <button className="btn btn-primary" onClick={() => onRound('keep')}>
            {t.celebration.keepCards}
          </button>
          <button className="btn" onClick={() => onRound('shuffle')}>
            {t.celebration.shuffleCards}
          </button>
          <button className="btn" onClick={() => onConfirmRound('rewrite')}>
            {t.celebration.rewriteCards}
          </button>
          <button className="btn" onClick={() => onConfirmRound('new')}>
            {t.celebration.newCards}
          </button>
          <button className="btn btn-ghost" onClick={onNewGame}>
            {t.host.newGame}
          </button>
        </div>
      </div>
    </div>
  )
}
