import { apiRequest } from './api'
import type {
  AtualizarCategoriaRequest,
  Categoria,
  CriarCategoriaRequest,
} from '../types/finance'

export const categoriaService = {
  listar: () => apiRequest<Categoria[]>('/categorias'),
  obterPorId: (id: number) => apiRequest<Categoria>(`/categorias/${id}`),
  criar: (payload: CriarCategoriaRequest) =>
    apiRequest<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  atualizar: (id: number, payload: AtualizarCategoriaRequest) =>
    apiRequest<Categoria>(`/categorias/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  excluir: (id: number) =>
    apiRequest<void>(`/categorias/${id}`, {
      method: 'DELETE',
    }),
}
