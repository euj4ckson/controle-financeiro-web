import { NavLink } from 'react-router-dom'
import { Icon } from './Icon'

const items = [
  { to: '/dashboard', label: 'Resumo', icon: 'home' as const },
  { to: '/lancamentos', label: 'Lançar', icon: 'wallet' as const },
  { to: '/categorias', label: 'Tags', icon: 'tags' as const },
  { to: '/relatorios', label: 'Análise', icon: 'chart' as const },
]

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navegação principal">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `bottom-nav__link${isActive ? ' is-active' : ''}`}
        >
          <Icon name={item.icon} className="bottom-nav__icon" />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
