import { Link } from 'react-router-dom'
import cookieChocoChunk from '@/assets/img/cookie-choco-chunk.jpg'
import Footer from '@/components/Footer'
import { findSection, splitParagraphs, usePageContents } from '@/lib/pageContent'
import { resolveProductImage } from '@/lib/productImages'


function About() {
  const contents = usePageContents('about')
  const hero = findSection(contents, 'Hero')
  const essence = findSection(contents, 'Essência')
  const essenceCards = contents.filter((content) => content.section === 'EssenceCard')
  const valuesHeader = findSection(contents, 'ValuesHeader')
  const valueCards = contents.filter((content) => content.section === 'ValueCard')
  const purpose = findSection(contents, 'Purpose')
  const vision = findSection(contents, 'Vision')
  const cta = findSection(contents, 'CTA')
  const essenceParagraphs = splitParagraphs(essence?.description)
  const fallbackEssenceCards = [
    ['Empresa familiar', 'Uma marca construída sobre honra, cuidado e compromisso com as pessoas.'],
    ['Produtos de qualidade', 'Cookies, sucos e alimentos preparados com atenção ao sabor e à experiência.'],
    ['Atendimento especial', 'Servir com alegria para que cada cliente se sinta único e bem recebido.'],
    ['Ambiente acolhedor', 'Um espaço agradável, limpo e organizado para tornar cada visita melhor.'],
  ]
  const fallbackValueCards = [
  [
    '✓',
    'Confiança',
    'Trabalhamos com transparência, responsabilidade e respeito em cada atendimento.'
  ],
  [
    '♡',
    'Atendimento próximo',
    'Ouvimos cada cliente com atenção para oferecer uma experiência acolhedora e personalizada.'
  ],
  [
    '✦',
    'Qualidade',
    'Buscamos excelência em cada detalhe para entregar sempre o melhor resultado.'
  ],
];

  return (
    <main className="bg-bg text-[#3d0d12]">
      <section className="h-screen bg-linear-to-r from-[#7a0013] to-[#cf0f3f]">
        <div className="grid h-full w-full grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 max-w-7xl justify-center mx-auto">
          <div className="text-primary-contrast">
            <p className="w-full font-subtitle text-2xl mt-10 sm:text-3xl font-bold italic text-primary-contrast">
              {hero?.subtitle || 'Donna Lupe • Cookies & Sucos'}
            </p>
            <h1 className="w-full font-display text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight">
              {hero?.title || 'Sabor, cuidado e atendimento para tornar seu dia especial'}
            </h1>

            <p className="mt-6 w-full text-base sm:text-lg md:text-xl leading-7 md:leading-8 text-justify text-white/90">
              {hero?.description || 'A Donna Lupe nasceu com o propósito de servir pessoas com produtos de qualidade, ambiente acolhedor e um atendimento que faz cada cliente se sentir único.'}
            </p>

            <Link
              to={hero?.buttonLink || '/shopping'}
              className="mt-8 inline-block rounded-full bg-primary px-8 py-3 font-semibold text-white transition hover:scale-105"
            >
              {hero?.buttonText || 'Conhecer cardápio'}
            </Link>
          </div>

          <div className="relative flex items-center justify-center h-auto md:h-full py-6 md:py-0">
              <img
                src={hero?.image ? resolveProductImage(hero.image, cookieChocoChunk) : cookieChocoChunk}
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
              {essence?.subtitle || 'Nossa essência'}
            </p>

            <h2 className="mt-3 font-display text-5xl font-extrabold leading-tight">
              {essence?.title || 'Uma empresa familiar feita para servir bem'}
            </h2>

            {(essenceParagraphs.length ? essenceParagraphs : [
              'Somos uma marca familiar que acredita no cuidado com as pessoas, na qualidade dos produtos e na força de um atendimento feito com alegria.',
              'Nossa missão é alimentar as pessoas com produtos de qualidade, em um ambiente agradável, limpo e organizado, fazendo com que cada cliente se sinta especial.',
            ]).map((paragraph, index) => (
              <p key={paragraph} className={`${index === 0 ? 'mt-6' : 'mt-4'} text-lg leading-8 text-justify text-[#5a4a49]`}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {(essenceCards.length
              ? essenceCards.map((card) => [card.title, card.description])
              : fallbackEssenceCards
            ).map(([title, description]) => (
              <div key={title} className="rounded-4xl bg-white py-5 px-10 shadow-sm">
                <h3 className="font-display text-3xl font-extrabold text-primary">
                  {title}
                </h3>
                <p className="mt-3 text-[#5a4a49]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary-contrast">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <p className="font-subtitle text-3xl font-bold italic text-primary">
            {valuesHeader?.subtitle || 'nossos valores'}
          </p>

          <h2 className="mt-2 font-display text-5xl font-extrabold md:text-6xl">
            {valuesHeader?.title || 'O que faz a Donna Lupe especial'}
          </h2>

          {(valuesHeader?.description) && (
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-[#5a4a49]">
              {valuesHeader.description}
            </p>
          )}

          <div className="mt-14 grid gap-8 lg:grid-cols-3 max-w-md lg:max-w-full mx-auto">
            {(valueCards.length
              ? valueCards.map((card) => [card.subtitle, card.title, card.description])
              : fallbackValueCards
            ).map(([icon, title, description]) => (
              <article key={title} className="rounded-4xl bg-white py-5 px-10 shadow-sm">
                <div className="text-5xl">{icon}</div>
                <h3 className="mt-6 font-display text-3xl font-extrabold">
                  {title}
                </h3>
                <p className="mt-4 leading-7 text-[#5a4a49]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 py-20 md:grid-cols-2">
        <article className="rounded-4xl bg-white px-8 py-10 shadow-sm">
          <p className="font-subtitle text-3xl font-bold italic text-primary">
            {purpose?.subtitle || 'Nosso propósito'}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">
            {purpose?.title || 'Entregar o melhor produto com a melhor qualidade'}
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5a4a49]">
            {purpose?.description || 'Nosso propósito é colocar cuidado, fé e excelência em tudo o que fazemos, oferecendo ao cliente produtos saborosos e bem preparados.'}
          </p>
        </article>

        <article className="rounded-4xl bg-white px-8 py-10 shadow-sm">
          <p className="font-subtitle text-3xl font-bold italic text-primary">
            {vision?.subtitle || 'Nossa visão'}
          </p>
          <h2 className="mt-3 font-display text-4xl font-extrabold leading-tight">
            {vision?.title || 'Crescer como referência em cookies e sucos'}
          </h2>
          <p className="mt-6 text-lg leading-8 text-[#5a4a49]">
            {vision?.description || 'Queremos ser reconhecidos como uma das melhores redes de cookies e sucos do Estado de São Paulo, crescendo com qualidade e pertencimento.'}
          </p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center bg-[radial-gradient(circle_at_center,rgba(215,38,77,0.06),transparent_60%)]">
        <h2 className="font-display text-5xl font-extrabold leading-tight md:text-7xl">
          {cta?.title || 'Pronto para conhecer nossos sabores?'}
        </h2>

        <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-[#5a4a49]">
          {cta?.description || 'Explore nosso cardápio e descubra os cookies e produtos preparados para tornar seu momento mais especial.'}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            to={cta?.buttonLink || '/shopping'}
            className="rounded-full bg-primary px-8 py-4 font-bold text-white shadow-md transition hover:scale-105"
          >
            {cta?.buttonText || 'Ver cardápio'}
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
