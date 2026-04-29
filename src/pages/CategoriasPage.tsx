import { useEffect, useState } from 'react'
import { CategoriaForm } from '../components/CategoriaForm'
import { EmptyState } from '../components/EmptyState'
import { LoadingState } from '../components/LoadingState'
import { PageHeader } from '../components/PageHeader'
import { StatusBanner } from '../components/StatusBanner'
import { categoriaService } from '../services/categoriaService'
import type { Categoria, CriarCategoriaRequest } from '../types/finance'

export function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<Categoria | null>(null)

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

  async function handleCreate(payload: CriarCategoriaRequest) {
    await categoriaService.criar(payload)
    setSuccess('Categoria criada com sucesso.')
    setEditing(null)
    await loadCategorias()
  }

  async function handleUpdate(payload: CriarCategoriaRequest) {
    if (!editing) {
      return
    }

    await categoriaService.atualizar(editing.id, payload)
    setSuccess('Categoria atualizada com sucesso.')
    setEditing(null)
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

  return (
    <section className="page">
      <PageHeader
        eyebrow="Cadastros"
        title="Categorias"
        description="Mantenha receitas e despesas organizadas por grupos reutilizáveis."
      />

      {error ? <StatusBanner tone="error" message={error} /> : null}
      {success ? <StatusBanner tone="success" message={success} /> : null}

      <CategoriaForm
        key={editing ? `edit-${editing.id}` : 'create'}
        initialData={editing}
        onCancel={editing ? () => setEditing(null) : undefined}
        onSubmit={editing ? handleUpdate : handleCreate}
        submitLabel={editing ? 'Salvar alteração' : 'Criar categoria'}
      />

      {loading ? (
        <LoadingState />
      ) : categorias.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie a primeira categoria para relacionar os lançamentos."
        />
      ) : (
        <section className="panel">
          <div className="panel__header">
            <h2>Lista de categorias</h2>
            <p>Você pode editar nome, tipo e status de ativação.</p>
          </div>

          <div className="stack-list">
            {categorias.map((categoria) => (
              <article key={categoria.id} className="list-card">
                <div>
                  <strong>{categoria.nome}</strong>
                  <span>
                    {categoria.tipo} • {categoria.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <div className="list-card__actions">
                  <button className="chip-button" onClick={() => setEditing(categoria)}>
                    Editar
                  </button>
                  <button className="chip-button chip-button--danger" onClick={() => handleDelete(categoria.id)}>
                    Excluir
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  )
}
