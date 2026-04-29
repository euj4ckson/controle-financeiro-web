import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { SummaryCard } from '../components/SummaryCard'
import { relatorioService } from '../services/relatorioService'
import type { RelatorioCategoria } from '../types/finance'
import { getCurrentMonthBounds, toInputDate } from '../utils/date'
import { formatCurrency } from '../utils/format'

export function RelatorioCategoriaPage() {
  const { start, end } = getCurrentMonthBounds()
  const [dataInicial, setDataInicial] = useState(start)
  const [dataFinal, setDataFinal] = useState(end)
  const [relatorio, setRelatorio] = useState<RelatorioCategoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadRelatorio(inicio = dataInicial, fim = dataFinal) {
    setLoading(true)
    setError('')

    try {
      const data = await relatorioService.obterPorCategoria(inicio, fim)
      setRelatorio(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Não foi possível gerar o relatório.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialLoad() {
      try {
        const data = await relatorioService.obterPorCategoria(start, end)

        if (!active) {
          return
        }

        setRelatorio(data)
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(
          loadError instanceof Error ? loadError.message : 'Não foi possível gerar o relatório.',
        )
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void initialLoad()

    return () => {
      active = false
    }
  }, [end, start])

  function getLastDaysRange(days: number) {
    const final = new Date()
    const inicial = new Date()
    inicial.setDate(final.getDate() - (days - 1))

    return {
      start: toInputDate(inicial),
      end: toInputDate(final),
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loadRelatorio(dataInicial, dataFinal)
  }

  async function applyPreset(inicio: string, fim: string) {
    setDataInicial(inicio)
    setDataFinal(fim)
    await loadRelatorio(inicio, fim)
  }

  const totalReceitas = relatorio
    .filter((item) => item.tipo === 'Receita')
    .reduce((total, item) => total + item.total, 0)
  const totalDespesas = relatorio
    .filter((item) => item.tipo === 'Despesa')
    .reduce((total, item) => total + item.total, 0)
  const topCategoria = [...relatorio].sort((first, second) => second.total - first.total)[0]
  const ultimos30Dias = getLastDaysRange(30)

  return (
    <section className="page">
      <PageHeader
        eyebrow="Análise"
        title="Relatório por categoria"
        description="Descubra rapidamente onde o dinheiro entrou ou saiu no período selecionado."
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="panel__header">
          <h2>Período</h2>
          <p>Use um intervalo rápido ou ajuste as datas manualmente.</p>
        </div>

        <div className="chip-row">
          <button type="button" className="chip-button" onClick={() => void applyPreset(start, end)}>
            Mês atual
          </button>
          <button
            type="button"
            className="chip-button"
            onClick={() => void applyPreset(ultimos30Dias.start, ultimos30Dias.end)}
          >
            Últimos 30 dias
          </button>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Data inicial</span>
            <input type="date" value={dataInicial} onChange={(event) => setDataInicial(event.target.value)} />
          </label>

          <label className="field">
            <span>Data final</span>
            <input type="date" value={dataFinal} onChange={(event) => setDataFinal(event.target.value)} />
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="button">
            Gerar relatório
          </button>
        </div>
      </form>

      {loading ? (
        <LoadingState />
      ) : relatorio.length === 0 ? (
        <EmptyState
          title="Nenhum dado no período"
          description="Altere o intervalo para localizar lançamentos em outras datas."
        />
      ) : (
        <>
          <div className="summary-grid">
            <SummaryCard label="Receitas" value={formatCurrency(totalReceitas)} tone="positive" />
            <SummaryCard label="Despesas" value={formatCurrency(totalDespesas)} tone="negative" />
            <SummaryCard label="Categorias" value={String(relatorio.length)} tone="neutral" />
          </div>

          {topCategoria ? (
            <section className="hero-panel hero-panel--compact">
              <div className="hero-panel__top">
                <span className="hero-panel__eyebrow">Maior volume</span>
                <span className={`status-pill${topCategoria.tipo === 'Despesa' ? ' status-pill--danger' : ''}`}>
                  {topCategoria.tipo}
                </span>
              </div>
              <strong className="hero-panel__value hero-panel__value--small">{topCategoria.categoria}</strong>
              <p>{formatCurrency(topCategoria.total)} no período selecionado.</p>
            </section>
          ) : null}

          <section className="panel">
            <div className="panel__header">
              <h2>Resumo por categoria</h2>
              <p>
                Período selecionado: {dataInicial} até {dataFinal}
              </p>
            </div>

            <div className="stack-list">
              {relatorio.map((item) => (
                <article key={`${item.categoriaId}-${item.tipo}`} className="list-card">
                  <div>
                    <strong>{item.categoria}</strong>
                    <div className="list-card__meta">
                      <span className={`status-pill${item.tipo === 'Despesa' ? ' status-pill--danger' : ''}`}>
                        {item.tipo}
                      </span>
                    </div>
                  </div>
                  <strong
                    className={item.tipo === 'Receita' ? 'amount amount--positive' : 'amount amount--negative'}
                  >
                    {formatCurrency(item.total)}
                  </strong>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </section>
  )
}
