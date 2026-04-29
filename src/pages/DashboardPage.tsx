import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
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
        title="Visão rápida do mês"
        description={`Resumo de ${formatMonthLabel(year, month)} com últimos lançamentos para consulta rápida.`}
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}

      {loading ? (
        <LoadingState />
      ) : (
        <>
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

          <section className="panel">
            <div className="panel__header">
              <h2>Últimos lançamentos</h2>
              <p>Os itens mais recentes ajudam a acompanhar o movimento diário.</p>
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
                      <span>
                        {lancamento.categoriaNome} • {formatDate(lancamento.data)}
                      </span>
                    </div>
                    <strong
                      className={
                        lancamento.tipo === 'Receita' ? 'amount amount--positive' : 'amount amount--negative'
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
