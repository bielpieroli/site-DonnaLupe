import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { PRODUCTS } from '@/data/products'
import { api, type PageContent } from '@/api'

import HomeCookieImg from '@/assets/img/cookie-home.png'
import cookieMorangoIMG from '@/assets/img/cookie-morango.jpg'
import cookieMatchaIMG from '@/assets/img/cookie-matcha.jpg'
import cookieChocoChunkIMG from '@/assets/img/cookie-choco-chunk.jpg'

type Favorite = {
  title: string
  description: string
  image: string
  buttonText: string
  buttonLink: string
}

type EssenceCard = {
  title: string
  description: string
}

const landingImageMap: Record<string, string> = {
  'cookie-home.png': HomeCookieImg,
  'cookie-morango.jpg': cookieMorangoIMG,
  'cookie-matcha.jpg': cookieMatchaIMG,
  'cookie-choco-chunk.jpg': cookieChocoChunkIMG,
}

const resolveLandingImage = (image: string, fallback: string) => {
  if (!image) return fallback
  if (image.startsWith('data:image/') || image.startsWith('http://') || image.startsWith('https://')) return image
  return landingImageMap[image] ?? fallback
}

const fallbackFavorites: Favorite[] = [
  {
    title: 'Cookie de morango',
    description: 'Cookie artesanal com pedaços de morango e ganache de chocolate.',
    image: cookieMorangoIMG,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
  {
    title: 'Cookie de Matcha',
    description: 'Cookie artesanal com matcha e ganache de chocolate.',
    image: cookieMatchaIMG,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
  {
    title: 'Cookie de chocolate',
    description: 'Cookie artesanal com pedaços de chocolate e ganache de chocolate.',
    image: cookieChocoChunkIMG,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
]

const fallbackEssenceCards: EssenceCard[] = [
  {
    title: 'Produtos de qualidade',
    description: 'Cookies, sucos e alimentos preparados com cuidado para entregar sabor e uma boa experiência.',
  },
  {
    title: 'Atendimento com alegria',
    description: 'Servir bem faz parte da nossa essência. Queremos que cada cliente se sinta especial.',
  },
  {
    title: 'Ambiente acolhedor',
    description: 'Um espaço agradável, limpo e organizado para tornar cada momento mais leve e gostoso.',
  },
]

export default function Home() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [landingContent, setLandingContent] = useState<PageContent[]>([])

  useEffect(() => {
    api.pageContents
      .getActive('landing')
      .then((res) => setLandingContent(res.contents ?? []))
      .catch(() => setLandingContent([]))
  }, [])

  const bySection = (section: string) =>
    landingContent.filter((item) => item.section === section && item.status !== 'Inativo')
  const firstSection = (section: string) => bySection(section)[0]

  const heroContent = firstSection('Hero')
  const hero = {
    subtitle: heroContent?.subtitle || 'Donna Lupe • Cookies & Sucos',
    title: heroContent?.title || 'Sabor que faz você se sentir especial',
    description:
      heroContent?.description ||
      'Produtos de qualidade, atendimento com alegria e aquele cuidado que transforma cada visita em um momento mais gostoso.',
    image: resolveLandingImage(heroContent?.image ?? '', HomeCookieImg),
    buttonText: heroContent?.buttonText || 'Ver cardápio',
    buttonLink: heroContent?.buttonLink || '/shopping',
  }

  const favoritesHeader = firstSection('Favoritos Header')
  const catalogHeader = firstSection('CatalogHeader')
  const catalogFooter = firstSection('CatalogFooter')
  const essenceHeader = firstSection('EssenceHeader')

  const favorites =
    bySection('Favoritos').length > 0
      ? bySection('Favoritos').slice(0, 3).map((item, index) => ({
          title: item.title,
          description: item.description,
          image: resolveLandingImage(item.image, fallbackFavorites[index]?.image ?? cookieChocoChunkIMG),
          buttonText: item.buttonText || 'Quero esse!',
          buttonLink: item.buttonLink || '/shopping',
        }))
      : fallbackFavorites

  const essenceCards =
    bySection('EssenceCard').length > 0
      ? bySection('EssenceCard').slice(0, 3).map((item) => ({
          title: item.title,
          description: item.description,
        }))
      : fallbackEssenceCards

  const ctaItems = bySection('CTA Final')
  const ctaMain = ctaItems[0]
  const ctaSecondary = ctaItems[1]
  const cta = {
    title: ctaMain?.title || 'Pronto para escolher seu sabor favorito?',
    subtitle: ctaMain?.subtitle || '',
    description: ctaMain?.description || 'Confira o cardápio e monte seu pedido com os produtos que combinam com o seu momento.',
    primaryText: ctaMain?.buttonText || 'Fazer meu pedido',
    primaryLink: ctaMain?.buttonLink || '/cart',
    secondaryText: ctaSecondary?.buttonText || 'Ver cardápio',
    secondaryLink: ctaSecondary?.buttonLink || '/shopping',
  }

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <main className="bg-[#f7f2ef] text-[#3d0d12]">
      <section className="h-screen bg-linear-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="grid h-full w-full grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 max-w-7xl justify-center mx-auto">
          <div className="text-primary-contrast">
            <p className="w-full font-subtitle text-2xl mt-10 sm:text-3xl font-bold italic text-primary-contrast">
              {hero.subtitle}
            </p>
            <h1 className="w-full font-display text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
              {hero.title}
            </h1>

            <p className="mt-6 w-full text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-white/90">
              {hero.description}
            </p>

            <Link
              to={hero.buttonLink}
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              {hero.buttonText}
            </Link>
          </div>

          <div className="relative flex items-center justify-center h-auto md:h-full py-6 md:py-0">
            <img
              src={hero.image}
              alt="Cookie"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-auto object-contain mx-auto transform -translate-y-10 sm:-translate-y-6 lg:translate-y-0"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center ">
        <p className="font-subtitle text-3xl font-bold italic text-primary">{favoritesHeader?.subtitle || 'Os mais amados!'}</p>
        <h2 className="mt-2 font-display text-5xl font-extrabold md:text-6xl">
          {favoritesHeader?.title || 'Nossos favoritos'}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5a4a49]">
          {favoritesHeader?.description || 'Cookies preparados com cuidado, sabor e qualidade para adoçar seu dia.'}
        </p>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {favorites.map((item, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-2xl border border-[#eadfda] bg-white shadow-sm transition hover:-translate-y-1"
            >
              <img src={item.image} alt={item.title} className="h-64 w-full object-cover" />

              <div className="p-6 text-left">
                <h3 className="font-display text-2xl font-extrabold text-[#54202a]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#6d5b59]">{item.description}</p>

                <Link
                  to={item.buttonLink}
                  className="mt-5 inline-block rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                >
                  {item.buttonText}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 bg-primary-contrast">
        <div className="grid items-end gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
              {catalogHeader?.title || 'Nosso cardápio'}
            </h2>
          </div>

          <p className="max-w-xl text-lg text-[#5a4a49]">
            {catalogHeader?.description || 'Escolha seus sabores favoritos e aproveite produtos feitos para entregar qualidade, carinho e uma experiência especial.'}
          </p>
        </div>

        <div ref={sliderRef} className="mt-12 overflow-x-auto px-4 scrollbar-hide">
          <div className="flex w-max gap-6 scroll-smooth">
            {PRODUCTS.map((item) => (
              <article
                key={item.id}
                className="group relative min-h-125 w-72.5 shrink-0 overflow-hidden rounded-4xl"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-black/10" />

                <div className="absolute right-5 top-5 rounded-full bg-primary px-4 py-3 text-sm font-bold text-white shadow-lg">
                  {item.price}
                </div>

                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="font-serif text-4xl font-bold">{item.name}</h3>

                  <p className="font-subtitle mt-1 text-lg font-bold italic text-primary-contrast">
                    {item.category}
                  </p>

                  <p className="mt-4 max-w-sm text-sm leading-6 text-white/90">
                    {item.description}
                  </p>

                  <Link
                    to="/shopping"
                    className="mt-6 block w-full rounded-full border border-white/50 bg-white/10 px-5 py-3 text-center font-semibold backdrop-blur-sm transition hover:bg-white hover:text-[#7a0013]"
                  >
                    Quero esse!
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => scroll('left')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>

        <p className="mt-10 text-center font-subtitle  font-bold text-2xl  text-primary">
          {catalogFooter?.title || 'Monte sua caixinha com os sabores que quiser!'}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="font-subtitle text-[28px] font-bold text-primary">
          {essenceHeader?.subtitle || 'Nossa essência'}
        </p>

        <h2 className="mt-2 font-serif text-5xl font-bold md:text-6xl">
          {essenceHeader?.title || 'O que torna a Donna Lupe especial'}
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#5a4a49]">
          {essenceHeader?.description || 'Nossa marca é guiada pelo compromisso de servir bem, oferecer produtos de qualidade e fazer com que cada pessoa se sinta bem recebida.'}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {essenceCards.map((item) => (
            <article key={item.title} className="rounded-[28px] bg-white px-7 py-8 text-left shadow-sm">
              <h3 className="font-display text-3xl font-extrabold text-primary">{item.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#5a4a49]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className=" bg-[radial-gradient(circle_at_center,rgba(215,38,77,0.06),transparent_60%)]">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
            {cta.title}
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-[#5a4a49]">
            {cta.subtitle} {cta.description}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to={cta.primaryLink}
              className="rounded-full bg-primary px-8 py-4 font-bold text-white shadow-md transition hover:scale-105"
            >
              {cta.primaryText}
            </Link>

            <Link
              to={cta.secondaryLink}
              className="rounded-full border border-[#d8c7c0] bg-white px-8 py-4 font-bold text-primary transition hover:scale-105"
            >
              {cta.secondaryText}
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
