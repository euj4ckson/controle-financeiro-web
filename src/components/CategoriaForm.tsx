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
        <p>Crie grupos reutilizáveis para manter os lançamentos organizados no celular.</p>
      </div>

      {erro ? <div className="inline-error">{erro}</div> : null}

      <label className="field">
        <span>Nome</span>
        <input
          value={nome}
          onChange={(event) => setNome(event.target.value)}
          maxLength={100}
          placeholder="Ex.: Moradia, Alimentação, Freelance"
        />
      </label>

      <div className="segmented-control" aria-label="Tipo da categoria">
        <button
          type="button"
          className={`segmented-control__button${tipo === 'Receita' ? ' is-active' : ''}`}
          onClick={() => setTipo('Receita')}
        >
          Receita
        </button>
        <button
          type="button"
          className={`segmented-control__button${tipo === 'Despesa' ? ' is-active' : ''}`}
          onClick={() => setTipo('Despesa')}
        >
          Despesa
        </button>
      </div>

      <div className="switch-card">
        <div>
          <strong>Categoria ativa</strong>
          <span>Desative apenas se quiser escondê-la das novas seleções.</span>
        </div>
        <label className="switch-field">
          <input
            type="checkbox"
            checked={ativo}
            onChange={(event) => setAtivo(event.target.checked)}
          />
          <span>{ativo ? 'Ativa' : 'Inativa'}</span>
        </label>
      </div>

      <div className="form-actions">
        {onCancel ? (
          <button type="button" className="button button--ghost" onClick={onCancel}>
            Cancelar
          </button>
        ) : null}
        <button type="submit" className="button button--full-mobile" disabled={saving}>
          {saving ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
