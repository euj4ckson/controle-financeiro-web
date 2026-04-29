import { useEffect, type ReactNode } from 'react'
import { Icon } from './Icon'

interface MobileSheetProps {
  open: boolean
  title: string
  description: string
  onClose: () => void
  children: ReactNode
}

export function MobileSheet({
  open,
  title,
  description,
  onClose,
  children,
}: MobileSheetProps) {
  useEffect(() => {
    if (!open) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, open])

  if (!open) {
    return null
  }

  return (
    <div className="mobile-sheet" role="dialog" aria-modal="true" aria-labelledby="mobile-sheet-title">
      <button
        type="button"
        className="mobile-sheet__backdrop"
        aria-label="Fechar formulário"
        onClick={onClose}
      />

      <div className="mobile-sheet__panel">
        <div className="mobile-sheet__handle" />
        <button type="button" className="mobile-sheet__close" aria-label="Fechar" onClick={onClose}>
          <Icon name="close" className="icon" />
        </button>

        <header className="mobile-sheet__header">
          <span className="page-header__eyebrow">Ação rápida</span>
          <h2 id="mobile-sheet-title">{title}</h2>
          <p>{description}</p>
        </header>

        {children}
      </div>
    </div>
  )
}
