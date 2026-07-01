import cookiesData from '@/mocks/cookies.json'
import type { CookieDetail } from '@/components/ProductDetailCard'
import { resolveProductImage } from '@/lib/productImages'

type CookieMock = Omit<CookieDetail, 'id' | 'img' | 'priceValue'> & { id: number; imageFile: string }

function priceToValue(price: string) {
  const parsed = Number(price.replace("R$", "").replace(",", ".").trim())
  return Number.isFinite(parsed) ? parsed : 0
}

export const PRODUCTS: CookieDetail[] = (cookiesData as CookieMock[]).map((cookie) => ({
  ...cookie,
  id: String(cookie.id),
  priceValue: priceToValue(cookie.price),
  img: resolveProductImage(cookie.imageFile),
}))
