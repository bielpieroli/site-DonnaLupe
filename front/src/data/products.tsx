import cookiesData from '@/mocks/cookies.json'
import type { CookieDetail } from '@/components/ProductDetailCard'
import { resolveProductImage } from '@/lib/productImages'

type CookieMock = Omit<CookieDetail, 'img'> & { imageFile: string }

export const PRODUCTS: CookieDetail[] = (cookiesData as CookieMock[]).map((cookie) => ({
  ...cookie,
  img: resolveProductImage(cookie.imageFile),
}))
