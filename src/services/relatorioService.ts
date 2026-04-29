import { apiRequest, createQueryString } from './api'
import type { RelatorioCategoria, SaldoMensal } from '../types/finance'

export const relatorioService = {
  obterSaldoMensal: (ano: number, mes: number) =>
    apiRequest<SaldoMensal>(`/relatorios/saldo-mensal${createQueryString({ ano, mes })}`),
  obterPorCategoria: (dataInicial: string, dataFinal: string) =>
    apiRequest<RelatorioCategoria[]>(
      `/relatorios/por-categoria${createQueryString({ dataInicial, dataFinal })}`,
    ),
}
