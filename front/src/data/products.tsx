import cookieCaramelo from '../assets/img/cookie-caramelo.jpg'
import cookieChocoChunk from '../assets/img/cookie-choco-chunk.jpg'
import cookieDoubleChoc from '../assets/img/cookie-double-choc.jpg'
import cookieLimao from '../assets/img/cookie-limao.jpg'
import cookieMatcha from '../assets/img/cookie-matcha.jpg'
import cookieMorango from '../assets/img/cookie-morango.jpg'
import cookiesData from '../mocks/cookies.json'
import type { CookieDetail } from '../components/ProductDetailCard'

type CookieMock = Omit<CookieDetail, 'img'> & { imageFile: string }

const cookieImages: Record<string, string> = {
  'cookie-caramelo.jpg': cookieCaramelo,
  'cookie-choco-chunk.jpg': cookieChocoChunk,
  'cookie-double-choc.jpg': cookieDoubleChoc,
  'cookie-limao.jpg': cookieLimao,
  'cookie-matcha.jpg': cookieMatcha,
  'cookie-morango.jpg': cookieMorango,
}

export const PRODUCTS: CookieDetail[] = (cookiesData as CookieMock[]).map((cookie) => ({
  ...cookie,
  img: cookieImages[cookie.imageFile] ?? cookieChocoChunk,
}))