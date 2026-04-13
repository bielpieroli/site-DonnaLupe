import { useState } from 'react';
import cookieCaramelo from '../../assets/img/cookie-caramelo.jpg';
import cookieChocoChunk from '../../assets/img/cookie-choco-chunk.jpg';
import cookieDoubleChoc from '../../assets/img/cookie-double-choc.jpg';
import cookieLimao from '../../assets/img/cookie-limao.jpg';
import cookieMatcha from '../../assets/img/cookie-matcha.jpg';
import cookieMorango from '../../assets/img/cookie-morango.jpg';
import ProductDetailCard, { type CookieDetail } from '../../components/ProductDetailCard';
import cookiesData from '../../mocks/cookies.json';

type CookieMock = Omit<CookieDetail, 'img'> & { imageFile: string };

const cookieImages: Record<string, string> = {
  'cookie-caramelo.jpg': cookieCaramelo,
  'cookie-choco-chunk.jpg': cookieChocoChunk,
  'cookie-double-choc.jpg': cookieDoubleChoc,
  'cookie-limao.jpg': cookieLimao,
  'cookie-matcha.jpg': cookieMatcha,
  'cookie-morango.jpg': cookieMorango,
};

const PRODUCTS = (cookiesData as CookieMock[]).map((cookie) => ({
  ...cookie,
  img: cookieImages[cookie.imageFile] ?? cookieChocoChunk,
}));

function Shopping() {
  const [selectedProduct, setSelectedProduct] = useState<CookieDetail | null>(null);
  const [quantity, setQuantity] = useState(1);

  const openDetails = (product: CookieDetail) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const closeDetails = () => {
    setSelectedProduct(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 px-46" >
        <p className="text-[var(--primary)] font-bold text-2xl font-subtitle">Monte seu pedido!</p>
        <h1 className="text-6xl font-extrabold mb-2 font-display text-[var(--text-h)] max-w-2xs">Nosso <span className="text-[var(--primary)]"> Catálogo</span></h1>
        <p className="text-[var(--muted)] text-1xl">Explore nossa seleção de produtos exclusivos.</p>
      </header>

      {/* Grid */}
      <div className="mx-auto grid  grid-cols-1 justify-items-center gap-y-10 gap-x-14 sm:grid-cols-2 lg:grid-cols-3 px-46">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="w-full cursor-pointer overflow-hidden rounded-[30px] bg-[#f4f2f0] shadow-[0_8px_28px_rgba(38,20,11,0.12)] transition-transform duration-300 hover:-translate-y-1"
            onClick={() => openDetails(product)}
          >
            <div className="relative">
              <img
                src={product.img}
                alt={product.name}
                className="h-64 w-full object-cover"
              />
              <span className="absolute left-4 top-4 rounded-full bg-[#f3efe9] px-4 py-2 text-sm font-semibold text-[#9a5b2f] shadow-sm">
                {product.badge}
              </span>
            </div>
            <div className="px-5 py-4">
              <div
                className={`mb-0.5 flex items-start gap-2 ${
                  product.name.length > 13 ? 'min-h-[3.4rem]' : 'min-h-[2.4rem]'
                }`}
              >
                <h2 className="min-w-0 flex-1 overflow-hidden pr-1 font-display font-extrabold text-[1.5rem] leading-[0.95] text-[var(--text-h)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {product.name}
                </h2>
                <p className="w-24 shrink-0 pt-0.5 text-right text-[1.4rem] font-extrabold leading-tight text-[var(--primary)]">
                  {product.price}
                </p>
              </div>

              <p className="mb-1 text-lg italic leading-none text-[var(--secondary)] font-subtitle font-bold" >
                {product.category}
              </p>

              <p className="mb-4 text-sm leading-snug text-[var(--text)]">{product.description}</p>

              <button
                className="w-full rounded-full bg-[var(--primary)] py-2 text-lg font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--secondary)]"
                onClick={() => openDetails(product)}
              >
                + Adicionar no carrinho
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(27,16,11,0.55)] p-4 md:p-8"
          onClick={closeDetails}
        >
          <div onClick={(event) => event.stopPropagation()}>
            <ProductDetailCard
              product={selectedProduct}
              quantity={quantity}
              onDecrease={() => setQuantity((prev) => Math.max(1, prev - 1))}
              onIncrease={() => setQuantity((prev) => prev + 1)}
              onClose={closeDetails}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Shopping;