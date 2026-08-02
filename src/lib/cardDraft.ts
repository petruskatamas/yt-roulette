export const CARD_SQUARES = 24

const key = (playerId: string) => `ytr-draft-${playerId}`

export function loadDraft(playerId: string): string[] {
  try {
    const raw = localStorage.getItem(key(playerId))
    const parsed = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed) && parsed.length === CARD_SQUARES) return parsed.map(String)
  } catch {
    // corrupt draft
  }
  return Array(CARD_SQUARES).fill('')
}

export function saveDraft(playerId: string, texts: string[]) {
  try {
    localStorage.setItem(key(playerId), JSON.stringify(texts))
  } catch {
    // storage full or blocked
  }
}

export function clearDraft(playerId: string) {
  try {
    localStorage.removeItem(key(playerId))
  } catch {
    // storage blocked
  }
}
