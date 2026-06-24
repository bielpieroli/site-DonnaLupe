import { findSection, splitParagraphs, usePageContents } from '@/lib/pageContent'
import { FaInstagram, FaWhatsapp } from 'react-icons/fa';

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
            'Av. Trabalhador são-carlense, 400 - Centro. CEP: 13566-590',
            'Seg-Sáb: 9h - 20h',
            'Dom: 10h - 18h'
            ]).map((line) => (
              <span key={line}>{line}<br /></span>
            ))}
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold">{social?.title || 'Vem com a gente!'}</h4>
          <p className="mt-4 leading-8 text-white/85">
            {((socialLines.length ? socialLines : ['Instagram', 'WhatsApp']).map((line, index) => {
              const trimmedLine = line.trim();
              if (trimmedLine === '') return null; // Ignora linhas vazias

              // Cria uma key segura combinando o texto e o índice
              const uniqueKey = `${trimmedLine}-${index}`;

              if (trimmedLine.toLowerCase().includes('instagram')) {
                return (
                  <span key={uniqueKey} className="block mt-2">
                    <a 
                      href="https://www.instagram.com/ludogs_br/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 underline hover:text-primary transition-all"
                    >
                      <FaInstagram className="text-xl text-pink-500" />
                      <span>Instagram</span>
                    </a>
                  </span>
                );
              } 
              
              if (trimmedLine.toLowerCase().includes('whatsapp')) {
                return (
                  <span key={uniqueKey} className="block mt-2">
                    <a 
                      href="https://wa.me/5516991828804" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 underline hover:text-primary transition-all"
                    >
                      <FaWhatsapp className="text-xl text-green-500" />
                      <span>WhatsApp</span>
                    </a>
                  </span>
                );
              } 

              // Fallback para qualquer outro texto comum que venha do backend
              return (
                <span key={uniqueKey} className="block mt-2">{trimmedLine}</span>
              );
            }))}
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
