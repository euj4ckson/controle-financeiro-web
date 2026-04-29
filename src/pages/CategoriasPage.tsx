import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CategoriaForm } from '../components/CategoriaForm'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { MobileSheet } from '../components/MobileSheet'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { SummaryCard } from '../components/SummaryCard'
import { categoriaService } from '../services/categoriaService'
import type { Categoria, CriarCategoriaRequest } from '../types/finance'

export function CategoriasPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isQueryCreateOpen = searchParams.get('novo') === '1'
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [isManualFormOpen, setIsManualFormOpen] = useState(false)
  const [tipoFiltro, setTipoFiltro] = useState<'Todas' | 'Receita' | 'Despesa'>('Todas')

  async function loadCategorias() {
    setLoading(true)
    setError('')

    try {
      const data = await categoriaService.listar()
      setCategorias(data)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Não foi possível carregar as categorias.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true

    async function initialLoad() {
      try {
        const data = await categoriaService.listar()

        if (!active) {
          return
        }

        setCategorias(data)
      } catch (loadError) {
        if (!active) {
          return
        }

        setError(
          loadError instanceof Error ? loadError.message : 'Não foi possível carregar as categorias.',
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
  }, [])

  function closeForm() {
    setEditing(null)
    setIsManualFormOpen(false)
    if (isQueryCreateOpen) {
      setSearchParams({}, { replace: true })
    }
  }

  function openCreateForm() {
    setEditing(null)
    setIsManualFormOpen(true)
  }

  function openEditForm(categoria: Categoria) {
    setEditing(categoria)
  }

  async function handleCreate(payload: CriarCategoriaRequest) {
    await categoriaService.criar(payload)
    setSuccess('Categoria criada com sucesso.')
    closeForm()
    await loadCategorias()
  }

  async function handleUpdate(payload: CriarCategoriaRequest) {
    if (!editing) {
      return
    }

    await categoriaService.atualizar(editing.id, payload)
    setSuccess('Categoria atualizada com sucesso.')
    closeForm()
    await loadCategorias()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Deseja realmente excluir esta categoria?')) {
      return
    }

    try {
      await categoriaService.excluir(id)
      setSuccess('Categoria excluída com sucesso.')
      await loadCategorias()
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'Não foi possível excluir a categoria.',
      )
    }
  }

  const categoriasFiltradas = categorias.filter(
    (categoria) => tipoFiltro === 'Todas' || categoria.tipo === tipoFiltro,
  )
  const categoriasReceita = categoriasFiltradas.filter((categoria) => categoria.tipo === 'Receita')
  const categoriasDespesa = categoriasFiltradas.filter((categoria) => categoria.tipo === 'Despesa')
  const categoriasAtivas = categorias.filter((categoria) => categoria.ativo).length
  const categoriasInativas = categorias.length - categoriasAtivas
  const isFormOpen = Boolean(editing) || isManualFormOpen || isQueryCreateOpen

  return (
    <section className="page">
      <PageHeader
        eyebrow="Cadastros"
        title="Categorias"
        description="Organize receitas e despesas em grupos simples, fáceis de selecionar no celular."
        actions={
          <button type="button" className="button page-header__button" onClick={openCreateForm}>
            Nova categoria
          </button>
        }
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}
      {success ? <StatusBanner tone="success" message={success} /> : null}

      <div className="summary-grid">
        <SummaryCard label="Total" value={String(categorias.length)} tone="neutral" />
        <SummaryCard label="Ativas" value={String(categoriasAtivas)} tone="positive" />
        <SummaryCard label="Inativas" value={String(categoriasInativas)} tone="negative" />
      </div>

      <section className="panel compact-panel">
        <div className="panel__header">
          <h2>Filtrar visualização</h2>
          <p>Reduza a lista para encontrar ou editar uma categoria mais rápido.</p>
        </div>

        <div className="chip-row">
          {(['Todas', 'Receita', 'Despesa'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`chip-button${tipoFiltro === tipo ? ' is-active' : ''}`}
              onClick={() => setTipoFiltro(tipo)}
            >
              {tipo}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <LoadingState />
      ) : categorias.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie a primeira categoria para relacionar os lançamentos."
        />
      ) : (
        <>
          <section className="panel">
            <div className="panel__header">
              <h2>Receitas</h2>
              <p>Categorias usadas para entradas e ganhos.</p>
            </div>

            {categoriasReceita.length === 0 ? (
              <EmptyState
                title="Sem categorias de receita"
                description="Crie uma categoria de receita para facilitar novos lançamentos."
              />
            ) : (
              <div className="stack-list">
                {categoriasReceita.map((categoria) => (
                  <article key={categoria.id} className="list-card">
                    <div>
                      <strong>{categoria.nome}</strong>
                      <div className="list-card__meta">
                        <span className="status-pill">{categoria.tipo}</span>
                        <span>{categoria.ativo ? 'Ativa' : 'Inativa'}</span>
                      </div>
                    </div>
                    <div className="list-card__actions">
                      <button className="chip-button" onClick={() => openEditForm(categoria)}>
                        Editar
                      </button>
                      <button
                        className="chip-button chip-button--danger"
                        onClick={() => handleDelete(categoria.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel">
            <div className="panel__header">
              <h2>Despesas</h2>
              <p>Categorias usadas para saídas e custos recorrentes.</p>
            </div>

            {categoriasDespesa.length === 0 ? (
              <EmptyState
                title="Sem categorias de despesa"
                description="Crie uma categoria de despesa para manter os gastos organizados."
              />
            ) : (
              <div className="stack-list">
                {categoriasDespesa.map((categoria) => (
                  <article key={categoria.id} className="list-card">
                    <div>
                      <strong>{categoria.nome}</strong>
                      <div className="list-card__meta">
                        <span className="status-pill">{categoria.tipo}</span>
                        <span>{categoria.ativo ? 'Ativa' : 'Inativa'}</span>
                      </div>
                    </div>
                    <div className="list-card__actions">
                      <button className="chip-button" onClick={() => openEditForm(categoria)}>
                        Editar
                      </button>
                      <button
                        className="chip-button chip-button--danger"
                        onClick={() => handleDelete(categoria.id)}
                      >
                        Excluir
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <MobileSheet
        open={isFormOpen}
        title={editing ? 'Editar categoria' : 'Nova categoria'}
        description="Cadastre ou ajuste uma categoria sem tirar o foco da lista."
        onClose={closeForm}
      >
        <CategoriaForm
          key={editing ? `edit-${editing.id}` : 'create'}
          initialData={editing}
          onCancel={closeForm}
          onSubmit={editing ? handleUpdate : handleCreate}
          submitLabel={editing ? 'Salvar alteração' : 'Criar categoria'}
        />
      </MobileSheet>
    </section>
  )
}
