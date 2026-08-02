import type { ReactNode } from 'react'

type Props = {
  onClose: () => void
  children: ReactNode
  className?: string
  onTop?: boolean
}

// Click-outside-to-close overlay shared by every modal on the host screen.
export function Dialog({ onClose, children, className = '', onTop }: Props) {
  return (
    <div className={`editor-overlay ${onTop ? 'z-top' : ''}`} onClick={onClose}>
      <div className={`editor-card ${className}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
