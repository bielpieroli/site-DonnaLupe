type CookieDetail = {
  id: number;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  price: string;
  weight: string;
  ingredients: string[];
  allergens: string;
  badge: string;
  img: string;
};

type ProductDetailCardProps = {
  product: CookieDetail;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onClose: () => void;
};

function ProductDetailCard({
  product,
  quantity,
  onDecrease,
  onIncrease,
  onClose,
}: ProductDetailCardProps) {
  return (
    <div className="w-full max-w-[980px] overflow-hidden rounded-[2rem] bg-[#f4f1ed] shadow-[0_20px_80px_rgba(30,16,10,0.45)] ">
      <div className="grid grid-cols-1 md:grid-cols-[0.95fr_1fr]">
        <div className="relative h-64 md:h-[80vh] md:max-h-[650px]">
          <img src={product.img} alt={product.name} className="h-full w-full object-cover" />
          <span
            className="absolute left-5 top-5 rounded-full px-4 py-2 text-sm font-semibold text-[#fff7ee] shadow-sm backdrop-blur-[2px]"
            style={{ backgroundColor: 'rgba(92, 58, 41, 0.78)' }}
          >
            {product.badge}
          </span>
        </div>

        <div className="relative flex max-h-[80vh] flex-col gap-8  px-6 py-5 md:px-8 md:py-7 justify-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 h-10 w-10 rounded-full bg-[#ded8d2] text-3xl leading-none text-[#5c4b43]"
            aria-label="Fechar detalhes"
          >
            ×
          </button>

          <div className="pt-8 md:pt-0">
            <p className="font-subtitle  text-[var(--secondary)] text-2xl">{product.subtitle}</p>
            <h2 className="font-display text-4xl font-extrabold leading-none text-[var(--text-h)]">{product.name}</h2>
            <p className="mt-2 text-lg font-bold leading-none text-[var(--primary)]">{product.price}</p>
          </div>

          <div>
              <p className="text-4xs leading-relaxed text-[#6a5b52]">{product.description}</p>
              <p className="text-4xs text-[#6a5b52]">
                Peso: <span className="font-bold text-[var(--text-h)]">{product.weight}</span>
              </p>
          </div>

          <div>
            <p className="mb-3 text-4xs text-[#6a5b52]">Ingredientes:</p>
            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full bg-[#e8e1d8] px-4 py-1.5  text-[#6d5f56] text-sm"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-full px-4 py-3 text-sm font-semibold text-[var(--primary)]"
            style={{ backgroundColor: 'rgba(211, 22, 53, 0.12)' }}
          >
            {product.allergens}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-12 items-center rounded-full border border-[#d5ccc2] bg-[#f4f1ed] px-4">
              <button
                type="button"
                onClick={onDecrease}
                className="w-8 text-sm leading-none text-[#5f4b40]"
                aria-label="Remover uma unidade"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold text-[var(--text-h)]">{quantity}</span>
              <button
                type="button"
                onClick={onIncrease}
                className="w-8 text-2xl leading-none text-[#5f4b40]"
                aria-label="Adicionar uma unidade"
              >
                +
              </button>
            </div>

            <button className="rounded-full bg-[var(--primary)] px-7 py-3 text-sm font-semibold text-[var(--primary-contrast)] transition-colors hover:bg-[var(--secondary)]">
              Adicionar {product.price}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CookieDetail };
export default ProductDetailCard;
