import { useState } from 'react'
import { localeOptions } from '@/lib/i18n'
import type { Messages } from '@/lib/i18n'
import type { GameState } from '@/types'
import { JoinGrid } from '@/components/JoinGrid'

type Props = {
  state: GameState
  t: Messages
  post: (path: string, body?: unknown) => void
}

export function SetupScreen({ state, t, post }: Props) {
  const [nameInput, setNameInput] = useState('')

  const addPlayer = () => {
    const name = nameInput.trim()
    if (!name) return
    post('/players', { name })
    setNameInput('')
  }

  return (
    <div className="setup-screen">
      <h1 className="logo">
        <span className="logo-yt">YT</span> ROULETTE
      </h1>
      <p className="tagline">{t.setup.tagline}</p>

      <div className="setup-card">
        <div className="lang-row">
          <span className="hint">{t.setup.language}</span>
          <select
            className="lang-select"
            value={state.locale}
            onChange={(e) => post('/locale', { locale: e.target.value })}
          >
            {localeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="mode-row">
          <input
            type="checkbox"
            checked={state.voteMode}
            onChange={(e) => post('/vote-mode', { on: e.target.checked })}
          />
          <span>
            <b>{t.vote.mode}</b>
            <span className="hint"> — {t.vote.modeHint}</span>
          </span>
        </label>

        <h2>{t.setup.who}</h2>
        <div className="name-row">
          <input
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
            placeholder={t.setup.namePlaceholder}
            maxLength={20}
            autoFocus
          />
          <button className="btn" onClick={addPlayer}>
            {t.setup.add}
          </button>
        </div>

        <div className="player-chips">
          {state.players.map((player) => (
            <span key={player.id} className="chip">
              {player.name}
              <button
                className="chip-x"
                onClick={() => post('/players/remove', { id: player.id })}
              >
                ×
              </button>
            </span>
          ))}
          {state.players.length === 0 && <span className="hint">{t.setup.needPlayer}</span>}
        </div>

        <JoinGrid players={state.players} t={t} />

        <button
          className="btn btn-primary btn-big"
          onClick={() => post('/start')}
          disabled={state.players.length === 0}
        >
          {t.setup.start}
        </button>
      </div>

      <details className="rules">
        <summary>{t.setup.rulesTitle}</summary>
        <ol>
          {t.setup.rules.map((rule, i) => (
            <li key={i}>{rule}</li>
          ))}
        </ol>
      </details>
    </div>
  )
}
