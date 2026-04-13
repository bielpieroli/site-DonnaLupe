import { useState } from 'react'
import ProductDetailCard, { type CookieDetail } from '../../components/ProductDetailCard'
import { PRODUCTS } from '../../data/products'

function Shopping() {
  const [selectedProduct, setSelectedProduct] = useState<CookieDetail | null>(null)
  const [quantity, setQuantity] = useState(1)

  const openDetails = (product: CookieDetail) => {
    setSelectedProduct(product)
    setQuantity(1)
  }

  const closeDetails = () => {
    setSelectedProduct(null)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 px-46">
        <p className="font-subtitle text-2xl font-bold text-[var(--primary)]">
          Monte seu pedido!
        </p>
        <h1 className="max-w-2xs font-display mb-2 text-6xl font-extrabold text-[var(--text-h)]">
          Nosso <span className="text-[var(--primary)]"> Catálogo</span>
        </h1>
        <p className="text-1xl text-[var(--muted)]">
          Explore nossa seleção de produtos exclusivos.
        </p>
      </header>

      <div className="mx-auto grid grid-cols-1 justify-items-center gap-x-14 gap-y-10 px-46 sm:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="min-w-0 flex-1 overflow-hidden pr-1 font-display text-[1.5rem] font-extrabold leading-[0.95] text-[var(--text-h)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]">
                  {product.name}
                </h2>
                <p className="w-24 shrink-0 pt-0.5 text-right text-[1.4rem] font-extrabold leading-tight text-[var(--primary)]">
                  {product.price}
                </p>
              </div>

              <p className="font-subtitle mb-1 text-lg font-bold italic leading-none text-[var(--secondary)]">
                {product.category}
              </p>

              <p className="mb-4 text-sm leading-snug text-[var(--text)]">
                {product.description}
              </p>

              <button
                className="w-full rounded-full bg-[var(--primary)] py-2 text-lg font-bold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--secondary)]"
                onClick={(event) => {
                  event.stopPropagation()
                  openDetails(product)
                }}
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
  )
}

export default Shopping