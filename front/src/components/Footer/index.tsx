import { findSection, splitParagraphs, usePageContents } from '@/lib/pageContent'

function Footer() {
  const contents = usePageContents('footer')
  const main = findSection(contents, 'Main')
  const location = findSection(contents, 'Location')
  const social = findSection(contents, 'Social')
  const copyright = findSection(contents, 'Copyright')
  const locationLines = splitParagraphs(location?.description)
  const socialLines = splitParagraphs(social?.description)

  return (
    <footer className=" bg-[#4a050b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-5xl font-bold">{main?.title || 'Donna Lupe'}</h3>
          <p className="mt-1 font-semibold text-white/70">{main?.subtitle || 'Cookies & Coffee Break'}</p>
          <p className="mt-4 max-w-sm leading-8 text-white/85">
            {main?.description || 'Cookies artesanais feitos com amor, ingredientes reais e muita manteiga.'}
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold">{location?.title || 'Onde nos encontrar'}</h4>
          <p className="mt-4 leading-8 text-white/85">
            {(locationLines.length ? locationLines : [
              'Rua dos Cookies, 123',
              'Docelandia, SP',
              'Seg-Sáb: 9h - 20h',
              'Dom: 10h - 18h',
            ]).map((line) => (
              <span key={line}>{line}<br /></span>
            ))}
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold">{social?.title || 'Vem com a gente!'}</h4>
          <p className="mt-4 leading-8 text-white/85">
            {(socialLines.length ? socialLines : ['Instagram', 'TikTok', 'WhatsApp']).map((line) => (
              <span key={line}>{line}<br /></span>
            ))}
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/70">
        {copyright?.title || 'Feito com amor © 2025 Donna Lupe'}
      </div>
    </footer>
  )
}
export default Footer
