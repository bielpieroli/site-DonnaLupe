import cookieTrio from '@/assets/img/trio-choco.png'
import cookieChocoChunk from '@/assets/img/cookie-choco-chunk.png'
import cookieDoubleChoc from '@/assets/img/cookie-double-choc.png'
import cookieRed from '@/assets/img/cookie-red.png'
import boloImg from '@/assets/img/Coffee/Products/bolo.jpg'
import browniesImg from '@/assets/img/Coffee/Products/brownies.jpg'
import cookiesImg from '@/assets/img/Coffee/Products/cookies.jpg'
import coxinhaImg from '@/assets/img/Coffee/Products/coxinha.jpg'
import empadaImg from '@/assets/img/Coffee/Products/empada.jpg'
import coffeeBreakImg from '@/assets/img/Coffee/coffebreak.jpg'
import cookieTravessa from '@/assets/img/cookie-travessa.png'

const productImageMap: Record<string, string> = {
  'trio-choco.png': cookieTrio,
  'cookie-choco-chunk.png': cookieChocoChunk,
  'cookie-double-choc.png': cookieDoubleChoc,
  'cookie-red.png': cookieRed,
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
