const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, '') ?? '/api'

function buildUrl(path: string) {
  return `${apiBaseUrl}${path}`
}

// A camada de services centraliza as chamadas HTTP e reduz repetição nas páginas.
export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = 'Não foi possível concluir a requisição.'

    try {
      const payload = (await response.json()) as { detail?: string; title?: string }
      message = payload.detail ?? payload.title ?? message
    } catch {
      message = response.statusText || message
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function createQueryString(params: Record<string, string | number | undefined | ''>) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}
