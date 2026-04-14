import { Link } from 'react-router-dom'
import cookieChocoChunk from '../../assets/img/cookie-choco-chunk.jpg'
import Footer from '../../components/Footer'


function About() {
  return (
    <main className="bg-bg text-[#3d0d12]">
      <section className="h-screen bg-linear-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="grid h-full w-full grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 max-w-7xl justify-center mx-auto">
          <div className="text-primary-contrast">
            <p className="w-full font-subtitle text-2xl mt-10 sm:text-3xl font-bold italic text-primary-contrast">
              Cookies & Coffee Break
            </p>
            <h1 className="w-full font-display text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              Feitos com amor desde a primeira fornada
            </h1>

            <p className="mt-6 w-full text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-justify text-white/90">
              Mais do que cookies, criamos momentos especiais. Cada receita é feita
              com ingredientes selecionados, carinho e aquele gostinho de casa que
              transforma qualquer dia.
            </p>

            <Link
              to="/shopping"
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              Conhecer cardápio
            </Link>
          </div>

          <div className="relative flex items-center justify-center h-auto md:h-full py-6 md:py-0">
              <img
                src={cookieChocoChunk}
                alt="Cookie Choco Chunk"
                className="w-full max-w-xs sm:max-w-sm lg:max-w-lg h-auto object-contain mx-auto transform -translate-y-15 lg:translate-y-0 shadow-2xl rounded-4xl overflow-hidden"
              />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <p className="font-subtitle text-3xl font-bold italic text-primary">
              Nossa essência
            </p>

            <h2 className="mt-3 font-display text-5xl font-extrabold leading-tight">
              Uma marca feita para adoçar momentos
            </h2>

            <p className="mt-6 text-lg leading-8 text-justify text-[#5a4a49]">
              Somos uma empresa dedicada a oferecer os melhores produtos e serviços
              para nossos clientes. Com anos de experiência no mercado, buscamos
              garantir qualidade, sabor e uma experiência memorável em cada pedido.
            </p>

            <p className="mt-4 text-lg leading-8 text-justify text-[#5a4a49]">
              Nossa equipe é formada por pessoas apaixonadas pelo que fazem,
              comprometidas em criar receitas artesanais, inovadoras e feitas com
              ingredientes de verdade.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <h3 className="font-display text-3xl font-extrabold text-primary">
                +10 anos
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Levando sabor, carinho e qualidade para nossos clientes.
              </p>
            </div>

            <div className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <h3 className="font-display text-3xl font-extrabold text-primary">
                Ingredientes reais
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Trabalhamos com produtos selecionados e receitas artesanais.
              </p>
            </div>

            <div className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <h3 className="font-display text-3xl font-extrabold text-primary">
                Atendimento especial
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Queremos que cada cliente tenha uma experiência incrível.
              </p>
            </div>

            <div className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <h3 className="font-display text-3xl font-extrabold text-primary">
                Receitas exclusivas
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Sabores únicos para agradar todos os gostos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-contrast">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-subtitle text-3xl font-bold italic text-primary">
            nossos valores
          </p>

          <h2 className="mt-2 font-display text-5xl font-extrabold md:text-6xl">
            O que faz a Donna Lupe especial
          </h2>

          <div className="mt-14 grid gap-8 lg:grid-cols-3 max-w-md lg:max-w-full mx-auto">
            <article className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <div className="text-5xl">💛</div>
              <h3 className="mt-6 font-display text-3xl font-extrabold">
                Feito com amor
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Cada cookie é preparado com cuidado, atenção e muito carinho.
              </p>
            </article>

            <article className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <div className="text-5xl">🍪</div>
              <h3 className="mt-6 font-display text-3xl font-extrabold">
                Qualidade em cada detalhe
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Utilizamos ingredientes selecionados para garantir sabor e frescor.
              </p>
            </article>

            <article className="rounded-4xl bg-white py-5 px-10 shadow-sm">
              <div className="text-5xl">✨</div>
              <h3 className="mt-6 font-display text-3xl font-extrabold">
                Experiência inesquecível
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Queremos transformar cada compra em um momento especial.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center bg-[radial-gradient(circle_at_center,rgba(215,38,77,0.06),transparent_60%)]">
        <h2 className="font-display text-5xl font-extrabold leading-tight md:text-7xl">
          Pronto para conhecer <br />
          nossos <span className="italic text-[#d7264d]">sabores?</span>
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-[#5a4a49]">
          Explore nosso cardápio e descubra os cookies que conquistaram nossos clientes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to="/shopping"
            className="rounded-full bg-primary px-8 py-4 font-bold text-white shadow-md transition hover:scale-105"
          >
            Ver cardápio 🍪
          </Link>

          <Link
            to="/cart"
            className="rounded-full border border-[#d8c7c0] bg-white px-8 py-4 font-bold text-primary transition hover:scale-105"
          >
            Fazer pedido 📋
          </Link>
        </div>
      </section>
      <Footer />
    </main>
    
  )
}

export default About