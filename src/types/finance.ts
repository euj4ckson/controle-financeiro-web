export type TipoLancamento = 'Receita' | 'Despesa'

export interface Categoria {
  id: number
  nome: string
  tipo: TipoLancamento
  ativo: boolean
}

export interface CriarCategoriaRequest {
  nome: string
  tipo: TipoLancamento
  ativo: boolean
}

export type AtualizarCategoriaRequest = CriarCategoriaRequest

export interface Lancamento {
  id: number
  descricao: string
  valor: number
  data: string
  tipo: TipoLancamento
  categoriaId: number
  categoriaNome: string
  observacao?: string | null
}

export interface CriarLancamentoRequest {
  descricao: string
  valor: number
  data: string
  tipo: TipoLancamento
  categoriaId: number
  observacao?: string | null
}

export type AtualizarLancamentoRequest = CriarLancamentoRequest

export interface LancamentoFiltros {
  dataInicial?: string
  dataFinal?: string
  tipo?: TipoLancamento | ''
  categoriaId?: number
}

export interface SaldoMensal {
  ano: number
  mes: number
  totalReceitas: number
  totalDespesas: number
  saldoFinal: number
}

export interface RelatorioCategoria {
  categoriaId: number
  categoria: string
  tipo: TipoLancamento
  total: number
}
