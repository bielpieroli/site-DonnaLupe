import { useState } from 'react'
import ProductDetailCard, { type CookieDetail } from '@/components/ProductDetailCard'
import { PRODUCTS } from '@/data/products'
import Footer from '@/components/Footer'

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
    <>
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 max-w-7xl sm:mb-10 lg:mb-12 px-4 sm:px-6 lg:px-8">
        <p className="font-subtitle text-lg font-bold text-primary sm:text-xl lg:text-2xl">
          Monte seu pedido!
        </p>

        <h1 className="mb-2 font-display text-4xl font-extrabold leading-tight text-text-h sm:text-5xl lg:text-6xl">
          Nosso <span className="text-primary">Catálogo</span>
        </h1>

        <p className="text-sm text-muted sm:text-base lg:text-lg">
          Explore nossa seleção de produtos exclusivos.
        </p>
      </header>

      <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-8 px-4 sm:px-6 lg:px-8">
        {PRODUCTS.map((product) => (
          <article
            key={product.id}
            className="flex h-full w-full max-w-sm cursor-pointer flex-col overflow-hidden rounded-[30px] bg-[#f4f2f0] shadow-[0_8px_28px_rgba(38,20,11,0.12)] transition-transform duration-300 hover:-translate-y-1"
            onClick={() => openDetails(product)}
          >
            <div className="relative">
              <img
                src={product.img}
                alt={product.name}
                className="h-52 w-full object-cover sm:h-56 lg:h-64"
              />

              <span className="absolute left-3 top-3 rounded-full bg-[#f3efe9] px-3 py-1.5 text-xs font-semibold text-[#9a5b2f] shadow-sm sm:text-sm">
                {product.badge}
              </span>
            </div>

            <div className="flex min-h-65 flex-col px-4 py-4 sm:px-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 overflow-hidden font-display text-xl font-extrabold leading-tight text-text-h [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] sm:text-2xl">
                  {product.name}
                </h2>

                <p className="shrink-0 whitespace-nowrap pt-1 text-right text-lg font-extrabold leading-tight text-primary sm:text-[1.4rem]">
                  {product.price}
                </p>
              </div>

              <p className="font-subtitle mb-2 text-base font-bold italic leading-none text-secondary sm:text-lg">
                {product.category}
              </p>

              <p className="mb-4 text-sm leading-snug text-text sm:text-[15px]">
                {product.description}
              </p>

              <button
                type="button"
                className="mt-auto w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary sm:text-base lg:text-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  openDetails(product);
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
          className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(27,16,11,0.55)] p-3 sm:p-4 md:p-8"
          onClick={closeDetails}
        >
          <div className="flex min-h-full items-center justify-center">
            <div
              className="w-full max-w-2xl md:max-w-5xl"
              onClick={(event) => event.stopPropagation()}
            >
              <ProductDetailCard
                product={selectedProduct}
                quantity={quantity}
                onDecrease={() => setQuantity((prev) => Math.max(1, prev - 1))}
                onIncrease={() => setQuantity((prev) => prev + 1)}
                onClose={closeDetails}
              />
            </div>
          </div>
        </div>
      )}
    </div>
    <Footer />
    </>
  )
}

export default Shopping