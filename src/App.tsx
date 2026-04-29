import { Navigate, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { DashboardPage } from './pages/DashboardPage'
import { CategoriasPage } from './pages/CategoriasPage'
import { LancamentosPage } from './pages/LancamentosPage'
import { RelatorioCategoriaPage } from './pages/RelatorioCategoriaPage'

function App() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lancamentos" element={<LancamentosPage />} />
          <Route path="/categorias" element={<CategoriasPage />} />
          <Route path="/relatorios" element={<RelatorioCategoriaPage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  )
}

export default App
