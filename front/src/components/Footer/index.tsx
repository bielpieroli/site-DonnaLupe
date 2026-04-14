function Footer() {
  return (
    <footer className=" bg-[#4a050b] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-5xl font-bold">Donna Lupe</h3>
          <p className="mt-4 max-w-sm leading-8 text-white/85">
            Cookies artesanais feitos com amor, ingredientes reais e muita manteiga.
            Porque a vida é curta demais pra cookie ruim. 💛
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold">Onde nos encontrar</h4>
          <p className="mt-4 leading-8 text-white/85">
            Rua dos Cookies, 123 <br />
            Docelandia, SP <br />
            Seg-Sáb: 9h - 20h <br />
            Dom: 10h - 18h
          </p>
        </div>

        <div>
          <h4 className="text-xl font-bold">Vem com a gente!</h4>
          <p className="mt-4 leading-8 text-white/85">
            Instagram <br />
            TikTok <br />
            WhatsApp
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/70">
        Feito com 🍪 e muito amor © 2025 Donna Lupe
      </div>
    </footer>
  )
}

export default Footer