import cookieCaramelo from '@/assets/img/cookie-caramelo.jpg'
import cookieChocoChunk from '@/assets/img/cookie-choco-chunk.jpg'
import cookieDoubleChoc from '@/assets/img/cookie-double-choc.jpg'
import cookieLimao from '@/assets/img/cookie-limao.jpg'
import cookieMatcha from '@/assets/img/cookie-matcha.jpg'
import cookieMorango from '@/assets/img/cookie-morango.jpg'
import boloImg from '@/assets/img/Coffee/Products/bolo.jpg'
import browniesImg from '@/assets/img/Coffee/Products/brownies.jpg'
import cookiesImg from '@/assets/img/Coffee/Products/cookies.jpg'
import coxinhaImg from '@/assets/img/Coffee/Products/coxinha.jpg'
import empadaImg from '@/assets/img/Coffee/Products/empada.jpg'
import coffeeBreakImg from '@/assets/img/Coffee/coffebreak.jpg'

const productImageMap: Record<string, string> = {
  'cookie-caramelo.jpg': cookieCaramelo,
  'cookie-choco-chunk.jpg': cookieChocoChunk,
  'cookie-double-choc.jpg': cookieDoubleChoc,
  'cookie-limao.jpg': cookieLimao,
  'cookie-matcha.jpg': cookieMatcha,
  'cookie-morango.jpg': cookieMorango,
  'coffee-bolo.jpg': boloImg,
  'coffee-brownies.jpg': browniesImg,
  'coffee-cookies.jpg': cookiesImg,
  'coffee-coxinha.jpg': coxinhaImg,
  'coffee-empada.jpg': empadaImg,
  'coffee-break.jpg': coffeeBreakImg,
}

export function resolveProductImage(image?: string, fallback = cookieChocoChunk) {
  if (!image) return fallback
  if (
    image.startsWith('data:image/') ||
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('/')
  ) {
    return image
  }
  return productImageMap[image] ?? fallback
}
