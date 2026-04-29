import { apiRequest, createQueryString } from './api'
import type {
  AtualizarLancamentoRequest,
  CriarLancamentoRequest,
  Lancamento,
  LancamentoFiltros,
} from '../types/finance'

export const lancamentoService = {
  listar: (filtros: LancamentoFiltros = {}) =>
    apiRequest<Lancamento[]>(
      `/lancamentos${createQueryString({
        dataInicial: filtros.dataInicial,
        dataFinal: filtros.dataFinal,
        tipo: filtros.tipo,
        categoriaId: filtros.categoriaId,
      })}`,
    ),
  obterPorId: (id: number) => apiRequest<Lancamento>(`/lancamentos/${id}`),
  criar: (payload: CriarLancamentoRequest) =>
    apiRequest<Lancamento>('/lancamentos', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  atualizar: (id: number, payload: AtualizarLancamentoRequest) =>
    apiRequest<Lancamento>(`/lancamentos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/lancamentos/${id}`, {
      method: 'DELETE',
    }),
}
