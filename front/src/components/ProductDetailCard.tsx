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
  onAddToCart?: (quantity: number) => void;
  added?: boolean;
};

function ProductDetailCard({
  product,
  quantity,
  onDecrease,
  onIncrease,
  onClose,
  onAddToCart,
  added = false,
}: ProductDetailCardProps) {
  return (
    <div className="w-full overflow-hidden rounded-3xl bg-[#f4f1ed] shadow-[0_20px_80px_rgba(30,16,10,0.45)] sm:rounded-4xl md:max-w-245">
      <div className="grid grid-cols-1 items-start md:grid-cols-[0.95fr_1fr]">
        <div className="relative h-56 self-start sm:h-72 md:h-130">
          <img
            src={product.img}
            alt={product.name}
            className="h-full w-full object-cover"
          />

          <span
            className="absolute left-3 top-3 rounded-full px-3 py-1.5 text-xs font-semibold text-[#fff7ee] shadow-sm backdrop-blur-[2px] sm:left-5 sm:top-5 sm:px-4 sm:py-2 sm:text-sm"
            style={{ backgroundColor: 'rgba(92, 58, 41, 0.78)' }}
          >
            {product.badge}
          </span>
        </div>

        <div className="relative flex flex-col gap-5 px-4 py-4 sm:px-6 sm:py-5 md:max-h-130 md:overflow-y-auto md:gap-8 md:px-8 md:py-7">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-[#ded8d2] text-2xl leading-none text-[#5c4b43] sm:right-4 sm:top-4 sm:h-10 sm:w-10 sm:text-3xl"
            aria-label="Fechar detalhes"
          >
            ×
          </button>

          <div className="pt-8 sm:pt-10 md:pt-0">
            <p className="font-subtitle text-lg text-secondary sm:text-xl md:text-2xl">
              {product.subtitle}
            </p>

            <h2 className="font-display text-3xl font-extrabold leading-tight text-text-h sm:text-4xl md:text-5xl">
              {product.name}
            </h2>

            <p className="mt-2 text-base font-bold leading-none text-primary sm:text-lg">
              {product.price}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm leading-relaxed text-[#6a5b52] sm:text-base">
              {product.description}
            </p>

            <p className="text-sm text-[#6a5b52] sm:text-base">
              Peso:{' '}
              <span className="font-bold text-text-h">
                {product.weight}
              </span>
            </p>
          </div>

          <div>
            <p className="mb-3 text-sm text-[#6a5b52] sm:text-base">
              Ingredientes:
            </p>

            <div className="flex flex-wrap gap-2">
              {product.ingredients.map((ingredient) => (
                <span
                  key={ingredient}
                  className="rounded-full bg-[#e8e1d8] px-3 py-1.5 text-xs text-[#6d5f56] sm:px-4 sm:text-sm"
                >
                  {ingredient}
                </span>
              ))}
            </div>
          </div>

          <div
            className="rounded-2xl px-4 py-3 text-sm font-semibold leading-relaxed text-primary sm:rounded-full"
            style={{ backgroundColor: 'rgba(211, 22, 53, 0.12)' }}
          >
            {product.allergens}
          </div>

          <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex h-12 items-center justify-center rounded-full border border-[#d5ccc2] bg-[#f4f1ed] px-4">
              <button
                type="button"
                onClick={onDecrease}
                className="w-8 text-xl leading-none text-[#5f4b40]"
                aria-label="Remover uma unidade"
              >
                -
              </button>

              <span className="w-10 text-center text-sm font-bold text-text-h sm:text-base">
                {quantity}
              </span>

              <button
                type="button"
                onClick={onIncrease}
                className="w-8 text-2xl leading-none text-[#5f4b40]"
                aria-label="Adicionar uma unidade"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => onAddToCart?.(quantity)}
              disabled={added}
              className={`w-full rounded-full px-6 py-3 text-sm font-semibold text-primary-contrast transition-colors sm:w-auto sm:px-7 ${
                added ? "bg-[#2d7a3a]" : "bg-primary hover:bg-secondary"
              }`}
            >
              {added ? "Adicionado ✓" : `Adicionar ${product.price}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { CookieDetail };
export default ProductDetailCard;