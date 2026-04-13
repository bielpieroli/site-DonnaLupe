import { Link } from 'react-router-dom'
import Footer from '../../components/Footer'
import { PRODUCTS } from '../../data/products'

import HeroCookieImg from '@/assets/img/cookie-double-choc.jpg'
import cookieMorangoIMG from '@/assets/img/cookie-morango.jpg'
import cookieMatchaIMG from '@/assets/img/cookie-matcha.jpg'
import cookieChocoChunkIMG from '@/assets/img/cookie-choco-chunk.jpg'

type Favorite = {
  title: string
  description: string
  image: string
}

type Testimonial = {
  name: string
  text: string
  bg: string
}

const favorites: Favorite[] = [
  {
    title: 'Cookie de morango',
    description: 'Cookie artesanal com pedaços de morango e ganache de chocolate',
    image: cookieMorangoIMG,
  },
  {
    title: 'Cookie de Matcha',
    description: 'Cookie artesanal com pedaços de Matcha e ganache de chocolate',
    image: cookieMatchaIMG,
  },
  {
    title: 'Cookie de chocolate',
    description: 'Cookie artesanal com pedaços de chocolate e ganache de chocolate',
    image: cookieChocoChunkIMG,
  },
]

const testimonials: Testimonial[] = [
  {
    name: 'Ana Clara',
    text: '“Gente, eu CHOREI comendo o de caramelo salgado. Não é exagero. É viciante demais! 🥹”',
    bg: 'bg-rose-50',
  },
  {
    name: 'Ana Clara',
    text: '“Gente, eu CHOREI comendo o de caramelo salgado. Não é exagero. É viciante demais! 🥹”',
    bg: 'bg-sky-50',
  },
  {
    name: 'Ana Clara',
    text: '“Gente, eu CHOREI comendo o de caramelo salgado. Não é exagero. É viciante demais! 🥹”',
    bg: 'bg-amber-50',
  },
]

function Home() {
  return (
    <main className="bg-[#f7f2ef] text-[#3d0d12]">
      <section className="bg-gradient-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="text-white">
            <h1 className="max-w-xl font-display text-5xl font-extrabold leading-tight md:text-7xl">
              Cookies que fazem sorrir
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Feitos à mão com ingredientes de verdade, muito amor e uma pitada de magia.
              Cada mordida é um abraço quentinho.
            </p>

            <Link
              to="/shopping"
              className="mt-8 inline-block rounded-full bg-[#ff365f] px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              Ver cookies
            </Link>
          </div>

          <div className="relative flex justify-center">
            <div className="relative h-[320px] w-[320px] overflow-hidden rounded-full bg-[#ffb26b] shadow-2xl md:h-[420px] md:w-[420px]">
              <img
                src={HeroCookieImg}
                alt="Cookie"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="font-subtitle text-3xl font-bold italic text-[#e63961]">Os mais amados!</p>
        <h2 className="mt-2 font-display text-5xl font-extrabold md:text-6xl">
          Nossos favoritos
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5a4a49]">
          Os cookies que nossos clientes não conseguem parar de pedir
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
                  to="/shopping"
                  className="mt-5 inline-block rounded-full bg-[#ff365f] px-5 py-2 text-sm font-semibold text-white"
                >
                  Quero Esse!
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid items-end gap-6 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
              Nossos <span className="text-[#d7264d]">Cookies</span>
            </h2>
          </div>

          <p className="max-w-xl text-lg text-[#5a4a49]">
            Arraste pro lado e escolha teu favorito. Cada um mais irresistível que o outro →.
          </p>
        </div>

        <div className="mt-12 overflow-x-auto pb-4">
          <div className="flex w-max gap-6">
            {PRODUCTS.map((item) => (
              <article
                key={item.id}
                className="group relative min-h-[500px] w-[290px] shrink-0 overflow-hidden rounded-[2rem]"
              >
                <img
                  src={item.img}
                  alt={item.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

                <div className="absolute right-5 top-5 rounded-full bg-[#ff365f] px-4 py-3 text-sm font-bold text-white shadow-lg">
                  {item.price}
                </div>

                <div className="absolute bottom-0 p-6 text-white">
                  <h3 className="font-serif text-4xl font-bold">{item.name}</h3>

                  <p className="font-subtitle mt-1 text-lg font-bold italic text-white/90">
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

        <p className="mt-10 text-center font-serif text-2xl italic text-[#e63961]">
          Monte sua caixinha com os sabores que quiser!
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 text-center">
        <p className="font-serif text-[28px] italic text-[#e63961]">
          o que tão falando por ai...
        </p>

        <h2 className="mt-2 font-serif text-5xl font-bold md:text-6xl">
          Declarações de <span className="italic text-[#d7264d]">Amor</span>
        </h2>

        <div className="mt-12 flex flex-wrap justify-center gap-6">
          {testimonials.map((item, index) => {
            const rotations = ['-rotate-3', 'rotate-3', '-rotate-2']
            const avatarBg = ['bg-[#f3c6cf]', 'bg-[#9fd0e8]', 'bg-[#ecd36f]']

            return (
              <article
                key={index}
                className={`${item.bg} ${rotations[index]} min-h-[220px] rounded-[28px] px-5 py-6 text-left shadow-lg`}
              >
                <div className="text-[16px] text-yellow-400">★★★★★</div>

                <p className="mt-5 max-w-[220px] text-[14px] leading-7 text-[#4e3e3d]">
                  {item.text}
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-[14px] font-bold text-[#7a2030] ${avatarBg[index]}`}
                  >
                    A
                  </div>

                  <span className="text-[14px] font-semibold text-[#2d0b12]">
                    {item.name}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="bg-[radial-gradient(circle_at_center,_rgba(215,38,77,0.06),_transparent_60%)]">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
            Tá esperando o que <br />
            pra <span className="italic text-[#d7264d]">experimentar?</span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-[#5a4a49]">
            Peça online e receba seus cookies quentinhos em minutos. Delivery ou retirada — você escolhe!
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/cart"
              className="rounded-full bg-[#ff365f] px-8 py-4 font-bold text-white shadow-md transition hover:scale-105"
            >
              Fazer meu pedido 🍪
            </Link>

            <Link
              to="/shopping"
              className="rounded-full border border-[#d8c7c0] bg-white px-8 py-4 font-bold text-[#7a0013] transition hover:bg-[#fff4f6]"
            >
              Ver cardápio 📋
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}

export default Home