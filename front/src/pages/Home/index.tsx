import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '@/components/Footer'
import { PRODUCTS } from '@/data/products'
import { api, type PageContent } from '@/api'

import HomeCookieImg from '@/assets/img/cookie-home.png'
import cookieRedImg from '@/assets/img/cookie-red.png'
import cookieChocoChunkImg from '@/assets/img/cookie-choco-chunk.png'
import cookieDoubleChocImg from '@/assets/img/cookie-double-choc.png'
import cookieTravessaImg from '@/assets/img/cookie-travessa.png'

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
  'cookie-red.png': cookieRedImg,
  'cookie-choco-chunk.png': cookieChocoChunkImg,
  'cookie-double-choc.png': cookieDoubleChocImg,
  'cookie-travessa.png': cookieTravessaImg,
}

const resolveLandingImage = (image: string, fallback: string) => {
  if (!image) return fallback

  if (
    image.startsWith('data:image/') ||
    image.startsWith('http://') ||
    image.startsWith('https://')
  ) {
    return image
  }

  return landingImageMap[image] ?? fallback
}

const fallbackFavorites: Favorite[] = [
  {
    title: 'Cookie Red',
    description:
      'Cookie artesanal com chocolate branco e notas suaves de baunilha.',
    image: cookieRedImg,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
  {
    title: 'Chocolate Ao Leite',
    description:
      'Cookie artesanal com chocolate belga ao leite, crocante por fora e derretido por dentro.',
    image: cookieChocoChunkImg,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
  {
    title: 'Double Chocolate',
    description:
      'Cookie artesanal com massa de cacau 70% e gotas de chocolate meio amargo.',
    image: cookieDoubleChocImg,
    buttonText: 'Quero esse!',
    buttonLink: '/shopping',
  },
]

const fallbackEssenceCards: EssenceCard[] = [
  {
    title: 'Produtos de qualidade',
    description:
      'Cookies, sucos e alimentos preparados com cuidado para entregar sabor e uma boa experiência.',
  },
  {
    title: 'Atendimento com alegria',
    description:
      'Servir bem faz parte da nossa essência. Queremos que cada cliente se sinta especial.',
  },
  {
    title: 'Ambiente acolhedor',
    description:
      'Um espaço agradável, limpo e organizado para tornar cada momento mais leve e gostoso.',
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
    landingContent.filter(
      (item) => item.section === section && item.status !== 'Inativo',
    )

  const firstSection = (section: string) => bySection(section)[0]

  const heroContent = firstSection('Hero')

  const hero = {
    subtitle: heroContent?.subtitle || 'Donna Lupe • Cookies & Sucos',
    title:
      heroContent?.title || 'Sabor que faz você se sentir especial',
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

  const favoriteContents = bySection('Favoritos')

  const favorites =
    bySection('Favoritos').length > 0
      ? bySection('Favoritos').slice(0, 3).map((item, index) => ({
          title: item.title,
          description: item.description,
          image: resolveLandingImage(
            item.image,
            fallbackFavorites[index]?.image ?? cookieChocoChunkImg,
          ),
          buttonText: item.buttonText || 'Quero esse!',
          buttonLink: item.buttonLink || '/shopping',
        }))
      : fallbackFavorites

  const essenceContents = bySection('EssenceCard')

  const essenceCards =
    essenceContents.length > 0
      ? essenceContents.slice(0, 3).map((item) => ({
          title: item.title,
          description: item.description,
        }))
      : fallbackEssenceCards

  const ctaItems = bySection('CTA Final')
  const ctaMain = ctaItems[0]
  const ctaSecondary = ctaItems[1]

  const cta = {
    title:
      ctaMain?.title || 'Pronto para escolher seu sabor favorito?',
    subtitle: ctaMain?.subtitle || '',
    description:
      ctaMain?.description ||
      'Confira o cardápio e monte seu pedido com os produtos que combinam com o seu momento.',
    primaryText: ctaMain?.buttonText || 'Fazer meu pedido',
    primaryLink: ctaMain?.buttonLink || '/cart',
    secondaryText: ctaSecondary?.buttonText || 'Ver cardápio',
    secondaryLink: ctaSecondary?.buttonLink || '/shopping',
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return

    const scrollAmount = 320

    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <main className="bg-[#f7f2ef] text-[#3d0d12]">
      <section className="h-screen bg-linear-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="mx-auto grid h-full w-full max-w-7xl grid-cols-1 items-center justify-center gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div className="text-primary-contrast">
            <p className="mt-10 w-full font-subtitle text-2xl font-bold italic text-primary-contrast sm:text-3xl">
              {hero.subtitle}
            </p>

            <h1 className="w-full font-display text-4xl font-extrabold leading-tight lg:text-5xl xl:text-6xl">
              {hero.title}
            </h1>

            <p className="mt-6 w-full text-base leading-7 text-white/90 sm:text-lg md:text-xl md:leading-8">
              {hero.description}
            </p>

            <Link
              to={hero.buttonLink}
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              {hero.buttonText}
            </Link>
          </div>

          <div className="relative flex h-auto items-center justify-center py-6 md:h-full md:py-0">
            <img
              src={hero.image}
              alt="Cookie"
              className="mx-auto h-auto w-full max-w-xs -translate-y-10 object-contain sm:max-w-sm sm:-translate-y-6 md:max-w-md lg:max-w-lg lg:translate-y-0"
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

      <section className="bg-primary-contrast py-20">
        <div className="mx-auto w-full max-w-7xl px-6">
          <div className="grid items-end gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
                {catalogHeader?.title || 'Nosso cardápio'}
              </h2>
            </div>

            <p className="max-w-xl text-lg text-[#5a4a49]">
              {catalogHeader?.description ||
                'Escolha seus sabores favoritos e aproveite produtos feitos para entregar qualidade, carinho e uma experiência especial.'}
            </p>
          </div>

          <div
            ref={sliderRef}
            className="mt-12 w-full overflow-x-auto scrollbar-hide"
          >
            <div className="flex w-max min-w-full gap-6 scroll-smooth lg:justify-center">
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

                  <div className="absolute bottom-0 w-full p-6 text-white">
                    <h3 className="font-serif text-4xl font-bold">
                      {item.name}
                    </h3>

                    <p className="mt-1 font-subtitle text-lg font-bold italic text-primary-contrast">
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
              type="button"
              onClick={() => scroll('left')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
              aria-label="Mover cardápio para a esquerda"
            >
              ←
            </button>

            <button
              type="button"
              onClick={() => scroll('right')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary transition hover:bg-primary hover:text-white"
              aria-label="Mover cardápio para a direita"
            >
              →
            </button>
          </div>

          <p className="mt-10 text-center font-subtitle text-2xl font-bold text-primary">
            {catalogFooter?.title ||
              'Monte sua caixinha com os sabores que quiser!'}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="font-subtitle text-[28px] font-bold text-primary">
          {essenceHeader?.subtitle || 'Nossa essência'}
        </p>

        <h2 className="mt-2 font-serif text-5xl font-bold md:text-6xl">
          {essenceHeader?.title ||
            'O que torna a Donna Lupe especial'}
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#5a4a49]">
          {essenceHeader?.description ||
            'Nossa marca é guiada pelo compromisso de servir bem, oferecer produtos de qualidade e fazer com que cada pessoa se sinta bem recebida.'}
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {essenceCards.map((item) => (
            <article
              key={item.title}
              className="rounded-[28px] bg-white px-7 py-8 text-left shadow-sm"
            >
              <h3 className="font-display text-3xl font-extrabold text-primary">
                {item.title}
              </h3>

              <p className="mt-4 text-sm leading-7 text-[#5a4a49]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_center,rgba(215,38,77,0.06),transparent_60%)]">
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