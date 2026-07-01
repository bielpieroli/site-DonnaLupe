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

export type Product = {
  id: number
  name: string
  subtitle: string
  kind: 'Shopping' | 'Coffee'
  category: string
  description: string
  priceValue: number
  price: string
  weight: string
  ingredients: string[]
  ingredientsText: string
  allergens: string
  badge: string
  image: string
  img: string
  stock: number
  flavor: string
  unit: string
  sizes: string[]
  sizesText: string
  sizeCounts: Record<string, number>
  sizeCountsText: string
  status: string
}

export type PageContent = {
  id: number
  page: string
  name: string
  section: string
  title: string
  subtitle: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
  status: string
}

export const api = {
  products: {
    getAll: (kind?: 'Shopping' | 'Coffee') => {
      const query = kind ? `?kind=${encodeURIComponent(kind)}` : ''
      return request<{ products: Product[] }>(`/products${query}`)
    },
  },
  pageContents: {
    getActive: (page: string) =>
      request<{ contents: PageContent[] }>(`/page-contents/${encodeURIComponent(page)}`),
  },
} as const

export { request }
