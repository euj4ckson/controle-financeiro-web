import { useState } from 'react'
import type {
  Categoria,
  CriarLancamentoRequest,
  Lancamento,
  TipoLancamento,
} from '../types/finance'

interface LancamentoFormProps {
  categorias: Categoria[]
  initialData?: Lancamento | null
  onCancel?: () => void
  onSubmit: (payload: CriarLancamentoRequest) => Promise<void>
  submitLabel: string
}

export function LancamentoForm({
  categorias,
  initialData,
  onCancel,
  onSubmit,
  submitLabel,
}: LancamentoFormProps) {
  const [descricao, setDescricao] = useState(initialData?.descricao ?? '')
  const [valor, setValor] = useState(initialData ? String(initialData.valor) : '')
  const [data, setData] = useState(initialData?.data ?? '')
  const [tipo, setTipo] = useState<TipoLancamento>(initialData?.tipo ?? 'Receita')
  const [categoriaId, setCategoriaId] = useState(initialData ? String(initialData.categoriaId) : '')
  const [observacao, setObservacao] = useState(initialData?.observacao ?? '')
  const [erro, setErro] = useState('')
  const [saving, setSaving] = useState(false)

  const categoriasFiltradas = categorias.filter(
    (categoria) =>
      categoria.tipo === tipo && (categoria.ativo || categoria.id === Number(categoriaId || 0)),
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!descricao.trim()) {
      setErro('Informe a descrição do lançamento.')
      return
    }

    if (!valor || Number(valor) <= 0) {
      setErro('O valor deve ser maior que zero.')
      return
    }

    if (!data) {
      setErro('Selecione a data do lançamento.')
      return
    }

    if (!categoriaId) {
      setErro('Selecione uma categoria.')
      return
    }

    setErro('')
    setSaving(true)

    try {
      await onSubmit({
        descricao: descricao.trim(),
        valor: Number(valor),
        data,
        tipo,
        categoriaId: Number(categoriaId),
        observacao: observacao.trim() || null,
      })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o lançamento.')
    } finally {
      setSaving(false)
    }
  }

  function handleTipoChange(nextTipo: TipoLancamento) {
    setTipo(nextTipo)

    const categoriaAtual = categorias.find((categoria) => categoria.id === Number(categoriaId))
    if (categoriaAtual && categoriaAtual.tipo !== nextTipo) {
      setCategoriaId('')
    }
  }

  return (
    <form className="panel form-panel" onSubmit={handleSubmit}>
      <div className="panel__header">
        <h2>{initialData ? 'Editar lançamento' : 'Novo lançamento'}</h2>
        <p>O formulário já separa categoria e tipo para refletir as regras da API.</p>
      </div>

      {erro ? <div className="inline-error">{erro}</div> : null}

      <label className="field">
        <span>Descrição</span>
        <input
          value={descricao}
          onChange={(event) => setDescricao(event.target.value)}
          maxLength={150}
        />
      </label>

      <div className="field-grid">
        <label className="field">
          <span>Valor</span>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={valor}
            onChange={(event) => setValor(event.target.value)}
          />
        </label>

        <label className="field">
          <span>Data</span>
          <input type="date" value={data} onChange={(event) => setData(event.target.value)} />
        </label>
      </div>

      <div className="field-grid">
        <label className="field">
          <span>Tipo</span>
          <select
            value={tipo}
            onChange={(event) => handleTipoChange(event.target.value as TipoLancamento)}
          >
            <option value="Receita">Receita</option>
            <option value="Despesa">Despesa</option>
          </select>
        </label>

        <label className="field">
          <span>Categoria</span>
          <select value={categoriaId} onChange={(event) => setCategoriaId(event.target.value)}>
            <option value="">Selecione</option>
            {categoriasFiltradas.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nome}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="field">
        <span>Observação</span>
        <textarea
          rows={3}
          value={observacao}
          onChange={(event) => setObservacao(event.target.value)}
          maxLength={500}
        />
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
