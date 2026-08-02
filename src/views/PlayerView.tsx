'use client'

import { useEffect, useRef } from 'react'
import { useGame, useWakeLock } from '@/lib/gameClient'
import { hasBingo } from '@/data/challenges'
import { clearDraft } from '@/lib/cardDraft'
import { messages } from '@/lib/i18n'
import { buzz, initSoundUnlock, pop } from '@/lib/sound'
import { BingoCard } from '@/components/BingoCard'
import { CardBuilder } from '@/components/CardBuilder'
import { VotePanel } from '@/components/VotePanel'

const WIN_BUZZ = [100, 60, 100, 60, 250]
const MARK_BUZZ = 40

export function PlayerView({ playerId }: { playerId: string }) {
  const { state, post, offline } = useGame(1000)
  const t = messages(state?.locale)
  const me = state?.players.find((p) => p.id === playerId)

  useWakeLock()
  useEffect(() => initSoundUnlock(), [])

  // a submitted card supersedes whatever was typed on this device
  const hasCard = !!me?.cells
  useEffect(() => {
    if (hasCard) clearDraft(playerId)
  }, [hasCard, playerId])

  const won = me?.cells ? hasBingo(me.cells) : false
  const wasWinning = useRef(false)
  useEffect(() => {
    if (won && !wasWinning.current) buzz(WIN_BUZZ)
    wasWinning.current = won
  }, [won])

  if (!state) {
    return <div className="center-note">{offline ? t.player.cantReach : t.common.connecting}</div>
  }

  if (!me) {
    return <div className="center-note">{t.player.notInGame}</div>
  }

  if (!me.cells) {
    return (
      <CardBuilder
        player={me}
        locale={state.locale}
        t={t}
        onSubmit={(texts) => post('/card', { playerId, texts })}
      />
    )
  }

  const cells = me.cells
  const claim = state.claims[0]
  const myClaims = new Set(
    state.claims.filter((c) => c.playerId === me.id).map((c) => c.cellIndex),
  )
  const myTurn = state.players[state.current]?.id === me.id
  const canMark = !!state.nowPlaying
  const spinBlocked = state.spinRequested || state.searchOpen || state.claims.length > 0

  const spinLabel = () => {
    if (state.claims.length > 0) return t.vote.spinBlocked
    if (state.searchOpen) return t.player.tvBusy
    return state.spinRequested ? t.player.spinning : t.player.spin
  }

  const toggle = (index: number) => {
    if (!cells[index].marked) {
      pop()
      buzz(MARK_BUZZ)
    }
    post('/toggle', { playerId, index })
  }

  return (
    <div className="player-screen pview">
      <div className="pcenter">
        <header className="pheader">
          <div className="pname" style={{ color: me.color }}>
            {me.name}
            {me.wins > 0 && <span className="pwins"> 🏆{me.wins}</span>}
          </div>
        </header>

        {claim && (
          <VotePanel
            claim={claim}
            playerId={playerId}
            t={t}
            onVote={(valid) => post('/vote', { playerId, claimId: claim.id, valid })}
          />
        )}

        {state.phase === 'play' && myTurn && !claim && (
          <button
            className="btn btn-primary spin-remote"
            disabled={spinBlocked}
            onClick={() => post('/spin/request', { playerId })}
          >
            {spinLabel()}
          </button>
        )}

        {state.celebration && (
          <div className="mini-celebration">{t.player.bingoBanner(state.celebration.name)}</div>
        )}
        {won && !state.celebration && <div className="mini-celebration">🏆 BINGÓ 🏆</div>}

        <BingoCard cells={cells} onToggle={toggle} t={t} pending={myClaims} locked={!canMark} />

        {offline && (
          <div className="pfooter">
            <span className="offline-note">{t.player.reconnecting}</span>
          </div>
        )}
      </div>
    </div>
  )
}
