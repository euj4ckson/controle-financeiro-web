import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { QuickActionLink } from '../components/QuickActionLink'
import { StatusBanner } from '../components/StatusBanner'
import { SummaryCard } from '../components/SummaryCard'
import { lancamentoService } from '../services/lancamentoService'
import { relatorioService } from '../services/relatorioService'
import type { Lancamento, SaldoMensal } from '../types/finance'
import { getCurrentMonthBounds } from '../utils/date'
import { formatCurrency, formatDate, formatMonthLabel } from '../utils/format'

export function DashboardPage() {
  const { year, month } = getCurrentMonthBounds()
  const [saldo, setSaldo] = useState<SaldoMensal | null>(null)
  const [ultimosLancamentos, setUltimosLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [saldoMensal, lancamentos] = await Promise.all([
          relatorioService.obterSaldoMensal(year, month),
          lancamentoService.listar(),
        ])

        setSaldo(saldoMensal)
        setUltimosLancamentos(lancamentos.slice(0, 5))
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Não foi possível carregar o dashboard.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadDashboard()
  }, [month, year])

  return (
    <section className="page">
      <PageHeader
        eyebrow="Controle Financeiro Pessoal"
        title="Seu dinheiro sem fricção"
        description={`Veja ${formatMonthLabel(year, month)}, registre movimentos em poucos toques e acompanhe o que mudou hoje.`}
        actions={
          <Link className="button button--ghost page-header__button" to="/lancamentos?novo=1&tipo=Despesa">
            Novo gasto
          </Link>
        }
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <>
          <section className="hero-panel">
            <div className="hero-panel__top">
              <span className="hero-panel__eyebrow">{formatMonthLabel(year, month)}</span>
              <Link className="chip-button chip-button--soft" to="/relatorios">
                Ver análise
              </Link>
            </div>
            <strong className={`hero-panel__value${(saldo?.saldoFinal ?? 0) < 0 ? ' is-negative' : ''}`}>
              {formatCurrency(saldo?.saldoFinal ?? 0)}
            </strong>
            <p>
              Saldo projetado do mês. Use os atalhos abaixo para registrar uma nova entrada ou
              saída sem navegar por telas longas.
            </p>
          </section>

          <div className="summary-grid">
            <SummaryCard
              label="Receitas"
              value={formatCurrency(saldo?.totalReceitas ?? 0)}
              tone="positive"
            />
            <SummaryCard
              label="Despesas"
              value={formatCurrency(saldo?.totalDespesas ?? 0)}
              tone="negative"
            />
            <SummaryCard
              label="Saldo"
              value={formatCurrency(saldo?.saldoFinal ?? 0)}
              tone="neutral"
            />
          </div>

          <section className="quick-actions">
            <QuickActionLink
              to="/lancamentos?novo=1&tipo=Receita"
              icon="income"
              title="Nova receita"
              description="Registrar entrada"
              tone="positive"
            />
            <QuickActionLink
              to="/lancamentos?novo=1&tipo=Despesa"
              icon="expense"
              title="Nova despesa"
              description="Lançar gasto"
              tone="negative"
            />
            <QuickActionLink
              to="/categorias?novo=1"
              icon="tags"
              title="Categorias"
              description="Organizar grupos"
              tone="neutral"
            />
            <QuickActionLink
              to="/relatorios"
              icon="chart"
              title="Relatórios"
              description="Ver totais por grupo"
              tone="neutral"
            />
          </section>

          <section className="panel">
            <div className="panel__header panel__header--split">
              <div>
                <h2>Últimos lançamentos</h2>
                <p>Os itens mais recentes ajudam a acompanhar o movimento diário.</p>
              </div>
              <Link className="chip-button" to="/lancamentos">
                Ver todos
              </Link>
            </div>

            {ultimosLancamentos.length === 0 ? (
              <EmptyState
                title="Nenhum lançamento encontrado"
                description="Cadastre um lançamento para começar a ver o histórico aqui."
              />
            ) : (
              <div className="stack-list">
                {ultimosLancamentos.map((lancamento) => (
                  <article key={lancamento.id} className="list-card">
                    <div>
                      <strong>{lancamento.descricao}</strong>
                      <div className="list-card__meta">
                        <span className="status-pill">{lancamento.categoriaNome}</span>
                        <span>{formatDate(lancamento.data)}</span>
                      </div>
                    </div>
                    <strong
                      className={
                        lancamento.tipo === 'Receita'
                          ? 'amount amount--positive'
                          : 'amount amount--negative'
                      }
                    >
                      {lancamento.tipo === 'Receita' ? '+' : '-'}
                      {formatCurrency(lancamento.valor)}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </section>
  )
}
