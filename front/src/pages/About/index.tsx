function About() {
  return (
    <main className="bg-[#f7f2ef] text-[#3d0d12]">
      <section className="bg-gradient-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="text-white">
            <p className="font-serif text-2xl italic text-[#ffd3dc]">
              Conheça nossa história
            </p>

            <h1 className="mt-4 max-w-xl font-serif text-5xl font-bold leading-tight md:text-7xl">
              Feitos com amor desde a primeira fornada
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Mais do que cookies, criamos momentos especiais. Cada receita é feita
              com ingredientes selecionados, carinho e aquele gostinho de casa que
              transforma qualquer dia.
            </p>

            <button className="mt-8 rounded-full bg-[#ff365f] px-8 py-3 font-semibold text-white transition hover:scale-105">
              Conhecer cardápio
            </button>
          </div>

          <div className="relative flex justify-center">
            <div className="overflow-hidden rounded-[2rem] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1000&q=80"
                alt="Equipe preparando cookies"
                className="h-[500px] w-full max-w-md object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <p className="font-serif text-3xl italic text-[#e63961]">
              Nossa essência
            </p>

            <h2 className="mt-3 font-serif text-5xl font-bold leading-tight">
              Uma marca feita para adoçar momentos
            </h2>

            <p className="mt-6 text-lg leading-8 text-[#5a4a49]">
              Somos uma empresa dedicada a oferecer os melhores produtos e serviços
              para nossos clientes. Com anos de experiência no mercado, buscamos
              garantir qualidade, sabor e uma experiência memorável em cada pedido.
            </p>

            <p className="mt-4 text-lg leading-8 text-[#5a4a49]">
              Nossa equipe é formada por pessoas apaixonadas pelo que fazem,
              comprometidas em criar receitas artesanais, inovadoras e feitas com
              ingredientes de verdade.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-serif text-3xl font-bold text-[#7a0013]">
                +10 anos
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Levando sabor, carinho e qualidade para nossos clientes.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-serif text-3xl font-bold text-[#7a0013]">
                Ingredientes reais
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Trabalhamos com produtos selecionados e receitas artesanais.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-serif text-3xl font-bold text-[#7a0013]">
                Atendimento especial
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Queremos que cada cliente tenha uma experiência incrível.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
              <h3 className="font-serif text-3xl font-bold text-[#7a0013]">
                Receitas exclusivas
              </h3>
              <p className="mt-3 text-[#5a4a49]">
                Sabores únicos para agradar todos os gostos.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#fff7f8]">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-serif text-3xl italic text-[#e63961]">
            nossos valores
          </p>

          <h2 className="mt-2 font-serif text-5xl font-bold md:text-6xl">
            O que faz a Donna Lupe especial
          </h2>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            <article className="rounded-[2rem] bg-white p-8 shadow-sm">
              <div className="text-5xl">💛</div>
              <h3 className="mt-6 font-serif text-3xl font-bold">
                Feito com amor
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Cada cookie é preparado com cuidado, atenção e muito carinho.
              </p>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-sm">
              <div className="text-5xl">🍪</div>
              <h3 className="mt-6 font-serif text-3xl font-bold">
                Qualidade em cada detalhe
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Utilizamos ingredientes selecionados para garantir sabor e frescor.
              </p>
            </article>

            <article className="rounded-[2rem] bg-white p-8 shadow-sm">
              <div className="text-5xl">✨</div>
              <h3 className="mt-6 font-serif text-3xl font-bold">
                Experiência inesquecível
              </h3>
              <p className="mt-4 leading-7 text-[#5a4a49]">
                Queremos transformar cada compra em um momento especial.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="font-serif text-5xl font-bold leading-tight md:text-7xl">
          Pronto para conhecer <br />
          nossos <span className="italic text-[#d7264d]">sabores?</span>
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-[#5a4a49]">
          Explore nosso cardápio e descubra os cookies que conquistaram nossos clientes.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button className="rounded-full bg-[#ff365f] px-8 py-4 font-bold text-white shadow-md transition hover:scale-105">
            Ver cardápio 🍪
          </button>

          <button className="rounded-full border border-[#d8c7c0] bg-white px-8 py-4 font-bold text-[#7a0013] transition hover:bg-[#fff4f6]">
            Fazer pedido 📋
          </button>
        </div>
      </section>
    </main>
  )
}

export default About