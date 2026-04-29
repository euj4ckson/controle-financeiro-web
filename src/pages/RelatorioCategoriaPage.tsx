import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { relatorioService } from '../services/relatorioService'
import type { RelatorioCategoria } from '../types/finance'
import { getCurrentMonthBounds } from '../utils/date'
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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await loadRelatorio(dataInicial, dataFinal)
  }

  return (
    <section className="page">
      <PageHeader
        eyebrow="Análise"
        title="Relatório por categoria"
        description="Veja quanto cada categoria acumulou dentro do período selecionado."
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}

      <form className="panel form-panel" onSubmit={handleSubmit}>
        <div className="panel__header">
          <h2>Período</h2>
          <p>O relatório é agrupado no backend para você estudar consultas com `GroupBy`.</p>
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
                  <span>{item.tipo}</span>
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
      )}
    </section>
  )
}
