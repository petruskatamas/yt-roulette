import { buzz, voteBlip } from '@/lib/sound'
import type { Messages } from '@/lib/i18n'
import type { Claim } from '@/types'

type Props = {
  claim: Claim
  playerId: string
  t: Messages
  onVote: (valid: boolean) => void
}

export function VotePanel({ claim, playerId, t, onVote }: Props) {
  const isClaimant = claim.playerId === playerId
  const myVote = isClaimant ? undefined : claim.votes[playerId]

  const cast = (valid: boolean) => {
    voteBlip(valid ? 2 : 0, valid)
    buzz(30)
    onVote(valid)
  }

  return (
    <div className="vote-panel">
      <div className="vote-claim">
        <span style={{ color: claim.color }}>{t.vote.claimedBy(claim.playerName)}</span>
        <div className="vote-text">„{claim.text}”</div>
      </div>

      {isClaimant ? (
        <div className="hint">{t.vote.yourClaim}</div>
      ) : myVote !== undefined ? (
        <div className="hint">{t.vote.voted}</div>
      ) : (
        <div className="vote-actions">
          <button className="btn btn-primary vote-yes" onClick={() => cast(true)}>
            {t.vote.valid}
          </button>
          <button className="btn vote-no" onClick={() => cast(false)}>
            {t.vote.invalid}
          </button>
        </div>
      )}
    </div>
  )
}
