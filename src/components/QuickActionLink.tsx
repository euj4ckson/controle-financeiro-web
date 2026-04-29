import { Link } from 'react-router-dom'
import { Icon } from './Icon'

interface QuickActionLinkProps {
  to: string
  icon: 'income' | 'expense' | 'tags' | 'chart'
  title: string
  description: string
  tone: 'positive' | 'negative' | 'neutral'
}

export function QuickActionLink({
  to,
  icon,
  title,
  description,
  tone,
}: QuickActionLinkProps) {
  return (
    <Link to={to} className={`quick-action quick-action--${tone}`}>
      <span className="quick-action__icon">
        <Icon name={icon} className="icon" />
      </span>
      <strong>{title}</strong>
      <span>{description}</span>
    </Link>
  )
}
