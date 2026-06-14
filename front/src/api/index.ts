const BASE_URL = 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new ApiError(res.status, body.error ?? `Erro ${res.status}`)
  }

  return res.json() as Promise<T>
}

// Public API — no auth required (customer-facing endpoints)
export type LandingContent = {
  id: number
  name: string
  secao: string
  titulo: string
  subtitulo: string
  descricao: string
  imagem: string
  botaoTexto: string
  botaoLink: string
  status: string
}

export const api = {
  landing: {
    getActive: () => request<{ contents: LandingContent[] }>('/landing'),
  },
  // Products will be fetched here once the backend implements GET /products
  // products: {
  //   getAll: () => request<ProductsResponse>('/products'),
  //   getById: (id: string) => request<ProductResponse>(`/products/${id}`),
  // },
} as const

export { request }
