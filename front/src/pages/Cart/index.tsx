import { useState } from "react";
import { Link } from "react-router-dom";
import {
  IoBagOutline,
  IoArrowBack,
  IoTrashOutline,
  IoCardOutline,
  IoLocationOutline,
  IoStorefrontOutline,
  IoCarOutline,
} from "react-icons/io5";
import { useCart, type CartItem } from "@/contexts/CartContext";
import {
  calculateFreight,
  type FreightQuote,
  type DeliveryAddress,
} from "@/services/freight";
import { createPaymentPreference } from "@/services/payment";
import Footer from "@/components/Footer";

type DeliveryMode = "delivery" | "pickup";

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_ADDRESS: DeliveryAddress = {
  cep: "",
  number: "",
  complement: "",
};

function isAddressComplete(addr: DeliveryAddress): boolean {
  return addr.cep.replace(/\D/g, "").length === 8 && addr.number.trim() !== "";
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);
  const [freightQuote, setFreightQuote] = useState<FreightQuote | null>(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const freightCost = deliveryMode === "pickup" ? 0 : (freightQuote?.price_reais ?? 0);
  const total = subtotal + freightCost;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const canCheckout = deliveryMode === "pickup" || freightQuote !== null;

  function handleModeChange(mode: DeliveryMode) {
    setDeliveryMode(mode);
    setFreightQuote(null);
    setFreightError(null);
  }

  function setField(field: keyof DeliveryAddress, value: string) {
    setAddress((prev) => ({ ...prev, [field]: value }));
    setFreightQuote(null);
    setFreightError(null);
  }

  async function handleCalculateFreight() {
    if (!isAddressComplete(address)) {
      setFreightError("Preencha todos os campos obrigatórios do endereço.");
      return;
    }
    setFreightLoading(true);
    setFreightError(null);
    setFreightQuote(null);
    try {
      const quote = await calculateFreight(address);
      setFreightQuote(quote);
    } catch (err) {
      setFreightError(err instanceof Error ? err.message : "Erro ao calcular frete.");
    } finally {
      setFreightLoading(false);
    }
  }

  async function handleCheckout() {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const pref = await createPaymentPreference(
        items,
        freightCost,
        deliveryMode === "pickup",
        deliveryMode === "delivery" ? address : undefined,
      );
      window.location.href = pref.initPoint;
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Erro ao iniciar pagamento.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <IoBagOutline className="h-24 w-24 text-primary opacity-25" />
          <h1 className="font-display text-4xl font-extrabold text-text-h sm:text-5xl">
            Seu carrinho está vazio
          </h1>
          <p className="max-w-xs text-base text-[#6a5b52]">
            Explore nosso catálogo e adicione seus cookies favoritos.
          </p>
          <Link
            to="/shopping"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary"
          >
            <IoArrowBack className="h-4 w-4" />
            Ver catálogo
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 pb-28 pt-24 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
        {/* Page header */}
        <div className="mb-10">
          <Link
            to="/shopping"
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#9a7b6e] transition-colors hover:text-primary"
          >
            <IoArrowBack className="h-4 w-4" />
            Continuar comprando
          </Link>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-text-h sm:text-5xl lg:text-6xl">
            Meu <span className="text-primary">Carrinho</span>
          </h1>
          <p className="mt-1 text-sm text-[#6a5b52]">
            {totalItems} {totalItems === 1 ? "item" : "itens"}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* ── Items list ── */}
          <section className="space-y-4">
            {items.map((item) => (
              <CartItemRow
                key={item.id}
                item={item}
                onIncrease={() => updateQuantity(item.id, 1)}
                onDecrease={() => updateQuantity(item.id, -1)}
                onRemove={() => removeItem(item.id)}
              />
            ))}
            <button
              type="button"
              onClick={clearCart}
              className="mt-2 text-xs font-medium text-[#b8a89e] transition-colors hover:text-primary"
            >
              Limpar carrinho
            </button>
          </section>

          {/* ── Order summary ── */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
            {/* Delivery mode selector */}
            <div className="rounded-2xl bg-[#f4f2f0] p-5 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-h">
                Como deseja receber?
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <ModeButton
                  active={deliveryMode === "delivery"}
                  onClick={() => handleModeChange("delivery")}
                  icon={<IoCarOutline className="h-5 w-5" />}
                  label="Entrega"
                  sub="Enviado ao seu endereço"
                />
                <ModeButton
                  active={deliveryMode === "pickup"}
                  onClick={() => handleModeChange("pickup")}
                  icon={<IoStorefrontOutline className="h-5 w-5" />}
                  label="Retirada"
                  sub="Retire na loja — grátis"
                />
              </div>

              {deliveryMode === "pickup" && (
                <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-[#6a5b52]">
                  <p className="font-semibold text-text-h">Donna Lupe</p>
                  <p className="text-xs">Centro Acdo. C.A.A.S.O. - R. Dr. Carlos de Camargo Salles - Parque Arnold Schimidt, São Carlos - SP</p>
                  <p className="mt-1 text-xs">Combine o horário pelo Instagram ou WhatsApp.</p>
                </div>
              )}
            </div>

            {/* Delivery address + freight calculator */}
            {deliveryMode === "delivery" && (
              <div className="rounded-2xl bg-[#f4f2f0] p-5 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
                <div className="mb-4 flex items-center gap-2">
                  <IoLocationOutline className="h-4 w-4 text-primary" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-text-h">
                    Endereço de Entrega
                  </h2>
                </div>

                <div className="space-y-2.5">
                  <div className="grid grid-cols-[1fr_100px] gap-2">
                    <Field
                      label="CEP *"
                      value={address.cep}
                      onChange={(v) => setField("cep", maskCEP(v))}
                      placeholder="13565-905"
                      inputMode="numeric"
                    />
                    <Field
                      label="Número *"
                      value={address.number}
                      onChange={(v) => setField("number", v)}
                      placeholder="400"
                    />
                  </div>

                  <Field
                    label="Complemento"
                    value={address.complement ?? ""}
                    onChange={(v) => setField("complement", v)}
                    placeholder="Apto 4, Bloco B…"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCalculateFreight}
                  disabled={freightLoading || !isAddressComplete(address)}
                  className="mt-4 w-full rounded-full bg-primary py-2.5 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {freightLoading ? "Calculando..." : "Calcular Frete"}
                </button>

                {freightError && (
                  <p className="mt-2 text-center text-xs font-medium text-primary">
                    {freightError}
                  </p>
                )}

                {freightQuote && (
                  <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold text-text-h">Entrega</p>
                        <p className="text-xs text-[#6a5b52]">
                          {freightQuote.distance_km.toFixed(1)} km até a loja
                        </p>
                      </div>
                      <span className="text-base font-extrabold text-primary">
                        {formatBRL(freightQuote.price_reais)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Price breakdown + checkout */}
            <div className="rounded-2xl bg-[#f4f2f0] p-5 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
              <h2 className="mb-4 text-xs font-bold uppercase tracking-widest text-text-h">
                Resumo do Pedido
              </h2>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-[#6a5b52]">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-h">{formatBRL(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6a5b52]">
                  <span>
                    {deliveryMode === "pickup" ? "Retirada" : "Frete"}
                  </span>
                  <span className="font-semibold text-text-h">
                    {deliveryMode === "pickup"
                      ? "Grátis"
                      : freightQuote
                        ? formatBRL(freightQuote.price_reais)
                        : "—"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#d5ccc2] pt-3">
                  <span className="text-base font-bold text-text-h">Total</span>
                  <span className="text-xl font-extrabold text-primary">
                    {formatBRL(total)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading || !canCheckout}
                title={!canCheckout ? "Calcule o frete para continuar" : undefined}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <IoCardOutline className="h-4 w-4" />
                {checkoutLoading ? "Aguarde..." : "Finalizar Pedido"}
              </button>

              {checkoutError && (
                <p className="mt-2 text-center text-xs font-medium text-primary">
                  {checkoutError}
                </p>
              )}

              <p className="mt-3 text-center text-[10px] text-[#c4b4aa]">
                Pagamento processado via Mercado Pago
              </p>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
}

function ModeButton({
  active,
  onClick,
  icon,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border-2 px-3 py-3 text-center transition-all ${
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-[#d5ccc2] bg-white text-[#9a7b6e] hover:border-primary/50"
      }`}
    >
      {icon}
      <span className="text-xs font-bold">{label}</span>
      <span className="text-[10px] leading-tight opacity-70">{sub}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b6e]">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full min-w-0 rounded-xl border border-[#d5ccc2] bg-white px-3 py-2 text-sm text-text-h placeholder:text-[#c4b4aa] focus:border-primary focus:outline-none"
      />
    </div>
  );
}

function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-4 rounded-2xl bg-[#f4f2f0] p-4 shadow-[0_4px_16px_rgba(38,20,11,0.08)] sm:gap-5 sm:p-5">
      <img
        src={item.img}
        alt={item.name}
        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
      />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-subtitle text-xs font-bold italic text-secondary">
              {item.subtitle}
            </p>
            <h3 className="font-display text-lg font-extrabold leading-tight text-text-h sm:text-xl">
              {item.name}
            </h3>
            <p className="text-xs text-[#9a7b6e]">
              {item.weight} · {item.price}/un
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remover ${item.name}`}
            className="flex-shrink-0 rounded-full p-1.5 text-[#b8a89e] transition-colors hover:bg-primary/10 hover:text-primary"
          >
            <IoTrashOutline className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex h-9 items-center rounded-full border border-[#d5ccc2] bg-white px-3">
            <button
              type="button"
              onClick={onDecrease}
              aria-label="Diminuir quantidade"
              className="w-7 text-lg leading-none text-[#5f4b40] transition-colors hover:text-primary"
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-bold text-text-h">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              aria-label="Aumentar quantidade"
              className="w-7 text-xl leading-none text-[#5f4b40] transition-colors hover:text-primary"
            >
              +
            </button>
          </div>

          <p className="text-base font-extrabold text-primary">
            {formatBRL(item.priceValue * item.quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
