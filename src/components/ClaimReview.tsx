import type { CSSProperties } from 'react'
import type { Messages } from '@/lib/i18n'
import type { Claim, GamePlayer, Verdict } from '@/types'

const MAX_SLABS = 3

type Props = {
  claim?: Claim
  queueLength: number
  players: GamePlayer[]
  verdict: Verdict | null
  t: Messages
  onDecideNow: (claimId: string) => void
}

export function ClaimReview({ claim, queueLength, players, verdict, t, onDecideNow }: Props) {
  const voters = claim ? players.filter((p) => p.id !== claim.playerId) : []
  const cast = claim ? Object.values(claim.votes) : []
  const yes = cast.filter(Boolean).length
  const no = cast.length - yes
  const undecided = voters.length - cast.length

  return (
    <div className="review-overlay">
      <div className="review-stack">
        {Array.from({ length: Math.min(MAX_SLABS, Math.max(0, queueLength - 1)) }).map((_, k) => (
          <div key={k} className="review-slab" style={{ '--i': k + 1 } as CSSProperties} />
        ))}

        {claim && (
          <div className="review-card" key={claim.id}>
            <div className="review-head">
              <span className="review-title">{t.vote.reviewTitle}</span>
              <span className="review-queue">
                {Array.from({ length: queueLength }).map((_, i) => (
                  <i key={i} className={i === 0 ? 'is-now' : ''} />
                ))}
              </span>
            </div>

            <div className="review-body">
              {claim.thumb && <img className="review-thumb" src={claim.thumb} alt="" />}
              <div className="review-main">
                <div className="review-claim" style={{ color: claim.color }}>
                  {t.vote.claimedBy(claim.playerName)}
                </div>
                <div className="review-text">„{claim.text}”</div>
                {claim.videoTitle && (
                  <div className="hint review-source">{t.vote.seenIn(claim.videoTitle)}</div>
                )}
              </div>
            </div>

            <div className="vote-bar">
              <span className="bar-yes" style={{ flexGrow: yes }} />
              <span className="bar-gap" style={{ flexGrow: Math.max(0.001, undecided) }} />
              <span className="bar-no" style={{ flexGrow: no }} />
            </div>

            <div className="review-voters">
              {voters.map((voter) => {
                const vote = claim.votes[voter.id]
                return (
                  <div key={voter.id} className="voter">
                    <span
                      className={`voter-chip ${vote === true ? 'is-yes' : vote === false ? 'is-no' : ''}`}
                      style={{ borderColor: voter.color }}
                    >
                      {vote === true ? '✓' : vote === false ? '✕' : voter.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="voter-name">{voter.name}</span>
                  </div>
                )
              })}
            </div>

            <div className="review-foot">
              <span className="hint">{t.vote.waitingFor(undecided)}</span>
              <button className="btn" onClick={() => onDecideNow(claim.id)}>
                {t.vote.decideNow}
              </button>
            </div>
          </div>
        )}

        {verdict && (
          <div className={`review-card is-leaving ${claim ? 'is-over' : ''}`}>
            <div className={`stamp ${verdict.accepted ? 'is-yes' : 'is-no'}`}>
              <div className="stamp-word">
                {verdict.accepted ? t.vote.accepted : t.vote.rejected}
              </div>
              <div className="stamp-claim">
                <span className="stamp-text">„{verdict.text}”</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
