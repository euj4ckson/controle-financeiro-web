import { NavLink } from 'react-router-dom'

const items = [
  { to: '/dashboard', label: 'Resumo' },
  { to: '/lancamentos', label: 'Lançamentos' },
  { to: '/categorias', label: 'Categorias' },
  { to: '/relatorios', label: 'Relatórios' },
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
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
