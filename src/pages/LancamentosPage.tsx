import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { LancamentoForm } from '../components/LancamentoForm'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { categoriaService } from '../services/categoriaService'
import { lancamentoService } from '../services/lancamentoService'
import type {
  Categoria,
  CriarLancamentoRequest,
  Lancamento,
  LancamentoFiltros,
  TipoLancamento,
} from '../types/finance'
import { getCurrentMonthBounds } from '../utils/date'
import { formatCurrency, formatDate } from '../utils/format'

export function LancamentosPage() {
  const { start, end } = getCurrentMonthBounds()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<Lancamento | null>(null)
  const [filtros, setFiltros] = useState<LancamentoFiltros>({
    dataInicial: start,
    dataFinal: end,
    tipo: '',
  })

  async function loadPage(activeFilters: LancamentoFiltros = filtros) {
    setLoading(true)
    setError('')

    try {
      const [categoriasData, lancamentosData] = await Promise.all([
        categoriaService.listar(),
        lancamentoService.listar(activeFilters),
      ])

      setCategorias(categoriasData)
      setLancamentos(lancamentosData)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar os lançamentos.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialLoad() {
      try {
        const [categoriasData, lancamentosData] = await Promise.all([
          categoriaService.listar(),
          lancamentoService.listar({
            dataInicial: start,
            dataFinal: end,
            tipo: '',
          }),
        ])

        if (!active) {
          return
        }

        setCategorias(categoriasData)
        setLancamentos(lancamentosData)
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(
          loadError instanceof Error ? loadError.message : 'Não foi possível carregar os lançamentos.',
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

  async function handleCreate(payload: CriarLancamentoRequest) {
    await lancamentoService.criar(payload)
    setSuccess('Lançamento criado com sucesso.')
    setEditing(null)
    await loadPage()
  }

  async function handleUpdate(payload: CriarLancamentoRequest) {
    if (!editing) {
      return
    }

    await lancamentoService.atualizar(editing.id, payload)
    setSuccess('Lançamento atualizado com sucesso.')
    setEditing(null)
    await loadPage()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Deseja realmente excluir este lançamento?')) {
      return
    }

    try {
      await lancamentoService.excluir(id)
      setSuccess('Lançamento excluído com sucesso.')
      await loadPage()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir o lançamento.',
      )
    }
  }

  async function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSuccess('')
    await loadPage(filtros)
  }

  function updateFiltro<K extends keyof LancamentoFiltros>(key: K, value: LancamentoFiltros[K]) {
    setFiltros((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const categoriasDoFiltro = categorias.filter(
    (categoria) => !filtros.tipo || categoria.tipo === filtros.tipo,
  )

  return (
    <section className="page">
      <PageHeader
        eyebrow="Movimentações"
        title="Lançamentos"
        description="Liste, filtre e mantenha o histórico financeiro atualizado."
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}
      {success ? <StatusBanner tone="success" message={success} /> : null}

      <form className="panel form-panel" onSubmit={handleFilterSubmit}>
        <div className="panel__header">
          <h2>Filtros</h2>
          <p>Os filtros são enviados para a API e aplicados diretamente na consulta do banco.</p>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Data inicial</span>
            <input
              type="date"
              value={filtros.dataInicial ?? ''}
              onChange={(event) => updateFiltro('dataInicial', event.target.value)}
            />
          </label>

          <label className="field">
            <span>Data final</span>
            <input
              type="date"
              value={filtros.dataFinal ?? ''}
              onChange={(event) => updateFiltro('dataFinal', event.target.value)}
            />
          </label>
        </div>

        <div className="field-grid">
          <label className="field">
            <span>Tipo</span>
            <select
              value={filtros.tipo ?? ''}
              onChange={(event) => {
                const tipo = event.target.value as TipoLancamento | ''
                updateFiltro('tipo', tipo)
                updateFiltro('categoriaId', undefined)
              }}
            >
              <option value="">Todos</option>
              <option value="Receita">Receita</option>
              <option value="Despesa">Despesa</option>
            </select>
          </label>

          <label className="field">
            <span>Categoria</span>
            <select
              value={filtros.categoriaId ?? ''}
              onChange={(event) =>
                updateFiltro(
                  'categoriaId',
                  event.target.value ? Number(event.target.value) : undefined,
                )
              }
            >
              <option value="">Todas</option>
              {categoriasDoFiltro.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="form-actions">
          <button type="submit" className="button">
            Aplicar filtros
          </button>
        </div>
      </form>

      <LancamentoForm
        key={editing ? `edit-${editing.id}` : 'create'}
        categorias={categorias}
        initialData={editing}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSubmit={editing ? handleUpdate : handleCreate}
        submitLabel={editing ? 'Salvar alteração' : 'Criar lançamento'}
      />

      {loading ? (
        <LoadingState />
      ) : lancamentos.length === 0 ? (
        <EmptyState
          title="Nenhum lançamento encontrado"
          description="Ajuste os filtros ou crie um novo lançamento para preencher a lista."
        />
      ) : (
        <section className="panel">
          <div className="panel__header">
            <h2>Lista de lançamentos</h2>
            <p>Itens ordenados do mais recente para o mais antigo.</p>
          </div>

          <div className="stack-list">
            {lancamentos.map((lancamento) => (
              <article key={lancamento.id} className="list-card list-card--stacked">
                <div>
                  <strong>{lancamento.descricao}</strong>
                  <span>
                    {lancamento.categoriaNome} • {formatDate(lancamento.data)}
                  </span>
                  {lancamento.observacao ? <small>{lancamento.observacao}</small> : null}
                </div>
                <div className="list-card__aside">
                  <strong
                    className={
                      lancamento.tipo === 'Receita' ? 'amount amount--positive' : 'amount amount--negative'
                    }
                  >
                    {lancamento.tipo === 'Receita' ? '+' : '-'}
                    {formatCurrency(lancamento.valor)}
                  </strong>
                  <div className="list-card__actions">
                    <button className="chip-button" onClick={() => setEditing(lancamento)}>
                      Editar
                    </button>
                    <button className="chip-button chip-button--danger" onClick={() => handleDelete(lancamento.id)}>
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
