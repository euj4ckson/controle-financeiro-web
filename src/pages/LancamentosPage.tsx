import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState } from '../components/EmptyState'
import { LancamentoForm } from '../components/LancamentoForm'
import { LoadingState } from '../components/LoadingState'
import { MobileSheet } from '../components/MobileSheet'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { SummaryCard } from '../components/SummaryCard'
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
  const [searchParams, setSearchParams] = useSearchParams()
  const queryTipo = searchParams.get('tipo')
  const isQueryCreateOpen = searchParams.get('novo') === '1'
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<Lancamento | null>(null)
  const [isManualFormOpen, setIsManualFormOpen] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [manualDefaultTipo, setManualDefaultTipo] = useState<TipoLancamento>('Receita')
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
        const initialFilters: LancamentoFiltros = {
          dataInicial: start,
          dataFinal: end,
          tipo: '',
        }

        const [categoriasData, lancamentosData] = await Promise.all([
          categoriaService.listar(),
          lancamentoService.listar(initialFilters),
        ])

        if (!active) {
          return
        }

        setCategorias(categoriasData)
        setLancamentos(lancamentosData)
        setFiltros(initialFilters)
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

  function closeForm() {
    setEditing(null)
    setIsManualFormOpen(false)
    if (isQueryCreateOpen || queryTipo) {
      setSearchParams({}, { replace: true })
    }
  }

  function openCreateForm(tipo: TipoLancamento = 'Despesa') {
    setEditing(null)
    setManualDefaultTipo(tipo)
    setIsManualFormOpen(true)
  }

  function openEditForm(lancamento: Lancamento) {
    setEditing(lancamento)
  }

  async function handleCreate(payload: CriarLancamentoRequest) {
    await lancamentoService.criar(payload)
    setSuccess('Lançamento criado com sucesso.')
    closeForm()
    await loadPage()
  }

  async function handleUpdate(payload: CriarLancamentoRequest) {
    if (!editing) {
      return
    }

    await lancamentoService.atualizar(editing.id, payload)
    setSuccess('Lançamento atualizado com sucesso.')
    closeForm()
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
    setIsFiltersOpen(false)
  }

  function updateFiltro<K extends keyof LancamentoFiltros>(key: K, value: LancamentoFiltros[K]) {
    setFiltros((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function applyQuickFilters(nextFilters: LancamentoFiltros) {
    setSuccess('')
    setFiltros(nextFilters)
    await loadPage(nextFilters)
  }

  const categoriasDoFiltro = categorias.filter(
    (categoria) => !filtros.tipo || categoria.tipo === filtros.tipo,
  )
  const totalReceitas = lancamentos
    .filter((lancamento) => lancamento.tipo === 'Receita')
    .reduce((total, lancamento) => total + lancamento.valor, 0)
  const totalDespesas = lancamentos
    .filter((lancamento) => lancamento.tipo === 'Despesa')
    .reduce((total, lancamento) => total + lancamento.valor, 0)
  const defaultTipo =
    queryTipo === 'Receita' || queryTipo === 'Despesa' ? queryTipo : manualDefaultTipo
  const isFormOpen = Boolean(editing) || isManualFormOpen || isQueryCreateOpen

  return (
    <section className="page">
      <PageHeader
        eyebrow="Movimentações"
        title="Lançamentos"
        description="Registre e encontre movimentações rápido, com filtros curtos e formulário sob demanda."
        actions={
          <button type="button" className="button page-header__button" onClick={() => openCreateForm('Despesa')}>
            Novo lançamento
          </button>
        }
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}
      {success ? <StatusBanner tone="success" message={success} /> : null}

      <div className="summary-grid">
        <SummaryCard label="Itens visíveis" value={String(lancamentos.length)} tone="neutral" />
        <SummaryCard label="Receitas" value={formatCurrency(totalReceitas)} tone="positive" />
        <SummaryCard label="Despesas" value={formatCurrency(totalDespesas)} tone="negative" />
      </div>

      <section className="panel compact-panel">
        <div className="panel__header panel__header--split">
          <div>
            <h2>Filtrar sem atrito</h2>
            <p>Troque o tipo com um toque. Abra filtros avançados só quando precisar.</p>
          </div>
          <button
            type="button"
            className="chip-button"
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            {isFiltersOpen ? 'Ocultar filtros' : 'Mais filtros'}
          </button>
        </div>

        <div className="chip-row">
          <button
            type="button"
            className={`chip-button${!filtros.tipo ? ' is-active' : ''}`}
            onClick={() =>
              void applyQuickFilters({
                ...filtros,
                tipo: '',
                categoriaId: undefined,
              })
            }
          >
            Todos
          </button>
          <button
            type="button"
            className={`chip-button${filtros.tipo === 'Receita' ? ' is-active' : ''}`}
            onClick={() =>
              void applyQuickFilters({
                ...filtros,
                tipo: 'Receita',
                categoriaId: undefined,
              })
            }
          >
            Só receitas
          </button>
          <button
            type="button"
            className={`chip-button${filtros.tipo === 'Despesa' ? ' is-active' : ''}`}
            onClick={() =>
              void applyQuickFilters({
                ...filtros,
                tipo: 'Despesa',
                categoriaId: undefined,
              })
            }
          >
            Só despesas
          </button>
          <button
            type="button"
            className="chip-button"
            onClick={() =>
              void applyQuickFilters({
                dataInicial: start,
                dataFinal: end,
                tipo: '',
                categoriaId: undefined,
              })
            }
          >
            Mês atual
          </button>
        </div>

        {isFiltersOpen ? (
          <form className="form-panel form-panel--compact" onSubmit={handleFilterSubmit}>
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
              <button
                type="button"
                className="button button--ghost"
                onClick={() => {
                  setFiltros({
                    dataInicial: start,
                    dataFinal: end,
                    tipo: '',
                    categoriaId: undefined,
                  })
                }}
              >
                Limpar
              </button>
              <button type="submit" className="button">
                Atualizar lista
              </button>
            </div>
          </form>
        ) : null}
      </section>

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
                  <div className="list-card__meta">
                    <span className="status-pill">{lancamento.categoriaNome}</span>
                    <span>{formatDate(lancamento.data)}</span>
                  </div>
                  {lancamento.observacao ? <small>{lancamento.observacao}</small> : null}
                </div>
                <div className="list-card__aside">
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
                  <div className="list-card__actions">
                    <button className="chip-button" onClick={() => openEditForm(lancamento)}>
                      Editar
                    </button>
                    <button
                      className="chip-button chip-button--danger"
                      onClick={() => handleDelete(lancamento.id)}
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <MobileSheet
        open={isFormOpen}
        title={editing ? 'Editar lançamento' : 'Novo lançamento'}
        description="Use o formulário curto abaixo e conclua a ação sem sair da lista."
        onClose={closeForm}
      >
        <LancamentoForm
          key={editing ? `edit-${editing.id}` : `create-${defaultTipo}`}
          categorias={categorias}
          initialData={editing}
          defaultTipo={defaultTipo}
          onCancel={closeForm}
          onSubmit={editing ? handleUpdate : handleCreate}
          submitLabel={editing ? 'Salvar alteração' : 'Criar lançamento'}
        />
      </MobileSheet>
    </section>
  )
}
