import { useMemo, useState } from "react";
import CoffeeImage from "@/assets/img/Coffee/coffebreak.jpg";
import cookiesImg from "@/assets/img/Coffee/Products/cookies.jpg";
import browniesImg from "@/assets/img/Coffee/Products/brownies.jpg";
import coxinhaImg from "@/assets/img/Coffee/Products/coxinha.jpg";
import empadaImg from "@/assets/img/Coffee/Products/empada.jpg";
import boloImg from "@/assets/img/Coffee/Products/bolo.jpg";
import DonnaLupeInfo from "@/constants/DonnaLupeInfo";
import Footer from "@/components/Footer";

type CoffeeItem = {
  id: string;
  name: string;
  description: string;
  unit: string;
  sizes?: string[];
  sizeCounts?: Record<string, number>;
  image: string;
};

type CartEntry = {
  key: string;
  id: string;
  name: string;
  unit: string;
  quantity: number;
  selectedSize?: string;
  sizeCounts?: Record<string, number>;
};

const serviceItems: CoffeeItem[] = [
  {
    id: "cookies",
    name: "Caixa de Cookies",
    description: "Seleção de cookies artesanais, crocantes e macios.",
    unit: "caixa",
    sizes: ["P", "M", "G"],
    sizeCounts: { P: 8, M: 16, G: 30 },
    image: cookiesImg,
  },
  {
    id: "brownies",
    name: "Caixa de Brownies",
    description: "Brownies fudgy feitos com chocolate de qualidade.",
    unit: "caixa",
    sizes: ["P", "M", "G"],
    sizeCounts: { P: 8, M: 16, G: 30 },
    image: browniesImg,
  },
  {
    id: "coxinha",
    name: "Caixa de Coxinhas",
    description: "Coxinha crocante com recheio cremoso.",
    unit: "caixa",
    sizes: ["P", "M", "G"],
    sizeCounts: { P: 20, M: 50, G: 80 },
    image: coxinhaImg,
  },
  {
    id: "empada",
    name: "Mini-Empadas",
    description: "Mini-Empadas tradicionais com recheios selecionados.",
    unit: "caixa",
    sizes: ["P", "M", "G"],
    sizeCounts: { P: 20, M: 30, G: 40 },
    image: empadaImg,
  },
  {
    id: "bolo",
    name: "Bolo Caseiro",
    description: "Bolos do dia, prontos para fatias ou inteiros.",
    unit: "bolo",
    sizes: ["P", "M", "G"],
    sizeCounts: { P: 1, M: 1, G: 1 },
    image: boloImg,
  },
];

export default function CoffeePage() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  const [cartItems, setCartItems] = useState<CartEntry[]>([]);

  const increase = (id: string) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const decrease = (id: string) => {
    setQuantities((prev) => {
      const nextValue = Math.max((prev[id] ?? 0) - 1, 0);
      return { ...prev, [id]: nextValue };
    });
  };


  const whatsappMessage = useMemo(() => {
    if (!cartItems.length) return "";

    const lines = cartItems.map((item) => {
      const sizePart = item.selectedSize ? ` (${item.selectedSize})` : "";

      const boxCountPart =
        item.unit === "caixa" && item.sizeCounts && item.selectedSize
          ? ` - ${item.sizeCounts[item.selectedSize] ?? "-"} unidades por caixa`
          : "";
      
      return `- ${item.quantity} ${item.unit}${item.quantity > 1 ? "s" : ""}${sizePart} ${item.name}${boxCountPart}`.trim();
    });

    
    const messageTemplate = [
      "Olá! Olhando o site, eu me encantei pelo serviço para eventos e gostaria de solicitar um orçamento.",
      "", 
      "Estou prevendo que os seguintes itens seriam ideais para o meu evento:",
      ...lines,
      "",
      "Queria receber o orçamento desses itens, por favor.",
    ];

    return messageTemplate
      .join("\n")
      .replace(/\u00A0/g, " ") // Troca de espaços não quebráveis por espaços normais
      .replace(/[^\x00-\x7F\u00C0-\u00FF\s-]/g, ""); // Remove caracteres de controle estranhos
  }, [cartItems]);

  const destino = DonnaLupeInfo.TELEFONE.replace(/\D/g, ""); // Remove caracteres não numéricos
  const whatsappHref = `https://wa.me/${destino}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main className="bg-background text-text">
      <section className="bg-secondary">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="text-white">
            <p className="font-serif text-2xl italic text-primary-contrast/90">Coffee Break para eventos</p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl font-bold leading-tight md:text-7xl">
              Monte o seu Coffee Break
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
              Escolha os produtos no catálogo do coffee e envie seu pedido para a gente pelo WhatsApp para um orçamento especial. Simples, prático e delicioso!
            </p>
          </div>

          <div className="relative flex justify-center">
            <div className="overflow-hidden rounded-[60px]">
              <img src={CoffeeImage} alt="Mesa de coffee break" className="h-100 w-100 object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div>
            <p className="font-serif text-3xl italic text-primary">escolha os itens</p>
            <h2 className="mt-2 font-serif text-5xl font-bold leading-tight md:text-6xl">
              Catálogo do <span className="italic text-secondary">Coffee</span>
            </h2>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {serviceItems.map((item) => {
                const quantity = quantities[item.id] ?? 0;

                return (
                  <article key={item.id} className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/20 bg-surface shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
                    <img src={item.image} alt={item.name} className="h-44 w-full object-cover" />
                    <div className="p-5 flex flex-col flex-1">
                            <h3 className="font-serif text-2xl font-bold text-text-h">{item.name}</h3>
                            <p className="mt-2 text-sm leading-6 text-text/80">{item.description}</p>

                      <div className="mt-5" />

                            <div className="mt-auto">
                              {item.sizes && (
                                <div className="mb-3 flex items-center gap-2">
                                  <label className="text-sm text-text/70">Tamanho:</label>
                                  <select
                                    value={selectedSizes[item.id] ?? item.sizes[1]}
                                    onChange={(e) =>
                                      setSelectedSizes((prev) => ({ ...prev, [item.id]: e.target.value }))
                                    }
                                    className="rounded-md border border-border/30 bg-surface px-2 py-1 text-sm text-text-h outline-none transition hover:border-primary/60 focus:border-primary"
                                  >
                                    {item.sizes.map((s) => {
                                      const count = item.sizeCounts ? item.sizeCounts[s] : undefined;
                                      const label = count ? `${s} — ${count} unidades` : s;
                                      return (
                                        <option key={s} value={s}>
                                          {label}
                                        </option>
                                      );
                                    })}
                                  </select>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-4 border-t border-transparent">
                                <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => decrease(item.id)}
                            className="h-9 w-9 rounded-full border border-border/30 bg-surface text-xl font-bold text-secondary hover:scale-105 hover:bg-muted transition-transform"
                          >
                            -
                          </button>
                          <span className="min-w-6 text-center font-bold text-secondary">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => increase(item.id)}
                            className="h-9 w-9 rounded-full bg-primary text-xl font-bold text-primary-contrast hover:scale-105 hover:brightness-95 transition-transform"
                          >
                            +
                          </button>
                                </div>
                                <span className="text-sm text-text/70">Qtd. selecionada</span>
                              </div>

                              <div className="mt-3 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const qty = quantities[item.id] ?? 0;
                                    if (qty <= 0) return;
                                    const size = selectedSizes[item.id] ?? (item.sizes ? item.sizes[1] : undefined);

                                    setCartItems((prev) => {
                                      const idx = prev.findIndex(
                                        (c) => c.id === item.id && c.selectedSize === size,
                                      );
                                      if (idx >= 0) {
                                        const next = [...prev];
                                        next[idx] = { ...next[idx], quantity: next[idx].quantity + qty };
                                        return next;
                                      }

                                      const entry = {
                                        key: `${item.id}_${size}_${Date.now()}`,
                                        id: item.id,
                                        name: item.name,
                                        unit: item.unit,
                                        quantity: qty,
                                        selectedSize: size,
                                        sizeCounts: item.sizeCounts,
                                      } as CartEntry;

                                      return [...prev, entry];
                                    });

                                    setQuantities((prev) => ({ ...prev, [item.id]: 0 }));
                                  }}
                                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-contrast hover:scale-105 hover:brightness-95 transition-transform"
                                >
                                  Adicionar
                                </button>
                              </div>
                            </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <aside className="h-fit rounded-4xl border border-border/20 bg-surface p-6 shadow-sm lg:sticky lg:top-24">
            <p className="font-serif text-2xl italic text-primary">seu pedido</p>
            <h3 className="mt-2 font-serif text-4xl font-bold">Carrinho</h3>

            {cartItems.length ? (
              <ul className="mt-6 space-y-4">
                {cartItems.map((item, index) => {
                  const unitsPerBox = item.sizeCounts && item.selectedSize ? item.sizeCounts[item.selectedSize] ?? 0 : undefined;
                  const totalUnits = unitsPerBox ? unitsPerBox * item.quantity : item.quantity;
                  return (
                    <li key={item.key} className="rounded-xl bg-muted p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-text-h">{item.name}</p>
                          <p className="text-sm text-text/80">
                            {item.quantity} {item.unit}{item.quantity > 1 && item.unit !== 'unidade' ? 's' : ''}
                            {item.selectedSize && <span className="ml-2">— {item.selectedSize}</span>}
                          </p>
                          {unitsPerBox && (
                            <p className="mt-1 text-xs text-text/70">{unitsPerBox} unidades por caixa — total {totalUnits} unidades</p>
                          )}
                        </div>
                        { /* Botão de WhatsApp, só habilitado se houver itens no carrinho */ }
                        <div className="ml-4 flex flex-col items-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCartItems((prev) => prev.filter((_, i) => i !== index))}
                            className="rounded-[5px] p-2 text-sm text-secondary transition hover:bg-primary/10"
                            aria-label={`Remover ${item.name}`}
                          >
                            x
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 text-text/70">Adicione itens para montar seu coffee break.</p>
            )}
            { /* Botão de WhatsApp, só habilitado se houver itens no carrinho */ }
            <div className="mt-6">
              <a
                href={cartItems.length ? whatsappHref : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!cartItems.length}
                className={`mt-1 block w-full rounded-full px-6 py-4 text-center font-bold transition ${
                  cartItems.length
                    ? "bg-[#25D366] text-white hover:brightness-95"
                    : "bg-border/30 text-primary-contrast pointer-events-none"
                }`}
              >
                Enviar pedido no WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}
