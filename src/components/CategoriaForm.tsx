import { useState } from 'react'
import type { Categoria, CriarCategoriaRequest, TipoLancamento } from '../types/finance'

interface CategoriaFormProps {
  initialData?: Categoria | null
  onCancel?: () => void
  onSubmit: (payload: CriarCategoriaRequest) => Promise<void>
  submitLabel: string
}

export function CategoriaForm({
  initialData,
  onCancel,
  onSubmit,
  submitLabel,
}: CategoriaFormProps) {
  const [nome, setNome] = useState(initialData?.nome ?? '')
  const [tipo, setTipo] = useState<TipoLancamento>(initialData?.tipo ?? 'Receita')
  const [ativo, setAtivo] = useState(initialData?.ativo ?? true)
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!nome.trim()) {
      setErro('Informe o nome da categoria.')
      return
    }

    setErro('')
    setSaving(true)

    try {
      await onSubmit({
        nome: nome.trim(),
        tipo,
        ativo,
      })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar a categoria.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel__header">
        <h2>{initialData ? 'Editar categoria' : 'Nova categoria'}</h2>
        <p>Cadastre categorias para organizar receitas e despesas por tipo.</p>
      </div>

      {erro ? <div className="inline-error">{erro}</div> : null}

      <label className="field">
        <span>Nome</span>
        <input value={nome} onChange={(event) => setNome(event.target.value)} maxLength={100} />
      </label>

      <label className="field">
        <span>Tipo</span>
        <select value={tipo} onChange={(event) => setTipo(event.target.value as TipoLancamento)}>
          <option value="Receita">Receita</option>
          <option value="Despesa">Despesa</option>
        </select>
      </label>

      <label className="switch-field">
        <input
          type="checkbox"
          checked={ativo}
          onChange={(event) => setAtivo(event.target.checked)}
        />
        <span>Categoria ativa</span>
      </label>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
