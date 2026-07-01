import { useState, useEffect, useRef } from "react";
import { resolveProductImage } from "@/lib/productImages";
import { Link } from "react-router-dom";
import {
  IoBagOutline,
  IoArrowBack,
  IoTrashOutline,
  IoLocationOutline,
  IoStorefrontOutline,
  IoCarOutline,
  IoCopyOutline,
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { useCart, type CartItem } from "@/contexts/CartContext";
import {
  calculateFreight,
  type FreightQuote,
  type DeliveryAddress,
} from "@/services/freight";
import { createPixPayment, getPixStatus, type PixPayment } from "@/services/payment";
import Footer from "@/components/Footer";

type DeliveryMode = "delivery" | "pickup";
type CheckoutStep = "cart" | "pix";

const PIX_TIMEOUT_SECONDS = 300; // 5 minutos exibidos ao usuário (MP expira em 6)

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// Horários de retirada em formato 24h: 10:00 → 18:00, intervalos de 30 min
const PICKUP_TIMES: string[] = (() => {
  const times: string[] = [];
  for (let h = 10; h <= 18; h++) {
    times.push(`${String(h).padStart(2, "0")}:00`);
    if (h < 18) times.push(`${String(h).padStart(2, "0")}:30`);
  }
  return times;
})();

function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const EMPTY_ADDRESS: DeliveryAddress = { cep: "", number: "", complement: "" };

function isAddressComplete(addr: DeliveryAddress): boolean {
  return addr.cep.replace(/\D/g, "").length === 8 && addr.number.trim() !== "";
}

function maskCEP(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal } = useCart();

  const [step, setStep] = useState<CheckoutStep>("cart");
  const [pixData, setPixData] = useState<PixPayment | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>("pending");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>("delivery");
  const [address, setAddress] = useState<DeliveryAddress>(EMPTY_ADDRESS);
  const [freightLoading, setFreightLoading] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);
  const [freightQuote, setFreightQuote] = useState<FreightQuote | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [pickupTime, setPickupTime] = useState("");

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(PIX_TIMEOUT_SECONDS);

  const freightCost = deliveryMode === "pickup" ? 0 : (freightQuote?.price_reais ?? 0);
  const total = subtotal + freightCost;
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const canCheckout =
    customerName.trim() !== "" &&
    customerEmail.includes("@") &&
    (deliveryMode === "pickup" ? pickupTime !== "" : freightQuote !== null);

  // Cronômetro regressivo de 5 minutos para o usuário
  useEffect(() => {
    if (step !== "pix" || paymentStatus !== "pending") return;
    setTimeLeft(PIX_TIMEOUT_SECONDS);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, paymentStatus]);

  // Polling de status do pagamento PIX
  useEffect(() => {
    if (step !== "pix" || !pixData || paymentStatus !== "pending") return;

    pollRef.current = setInterval(async () => {
      try {
        const res = await getPixStatus(pixData.payment_id);
        if (res.status !== "pending") {
          setPaymentStatus(res.status);
          if (pollRef.current) clearInterval(pollRef.current);
          if (res.status === "paid") clearCart();
        }
      } catch {
        // Ignora erros de rede durante polling
      }
    }, 5000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, pixData, paymentStatus, clearCart]);

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
      const pix = await createPixPayment(
        items,
        freightCost,
        deliveryMode === "pickup",
        customerName.trim(),
        customerEmail.trim(),
        deliveryMode === "delivery" ? address : undefined,
        deliveryMode === "pickup" ? pickupTime : undefined,
      );
      setPixData(pix);
      setPaymentStatus("pending");
      setStep("pix");
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Erro ao gerar pagamento PIX.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function handleCopyCode() {
    if (!pixData) return;
    await navigator.clipboard.writeText(pixData.pix_qr_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  if (items.length === 0 && step === "cart") {
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

  if (step === "pix" && pixData) {
    return (
      <>
        <div className="container mx-auto flex min-h-[80vh] flex-col items-center justify-center px-4 pb-28 pt-24">
          {paymentStatus === "paid" ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <IoCheckmarkCircleOutline className="h-24 w-24 text-green-500" />
              <h1 className="font-display text-4xl font-extrabold text-text-h">
                Pagamento confirmado!
              </h1>
              <p className="max-w-sm text-base text-[#6a5b52]">
                Recebemos seu pagamento. Você receberá um e-mail de confirmação em breve.
                Obrigada pela compra!
              </p>
              <Link
                to="/shopping"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary"
              >
                Continuar comprando
              </Link>
            </div>
          ) : paymentStatus === "cancelled" || paymentStatus === "expired" ? (
            <div className="flex flex-col items-center gap-6 text-center">
              <IoCloseCircleOutline className="h-24 w-24 text-red-400" />
              <h1 className="font-display text-4xl font-extrabold text-text-h">
                {paymentStatus === "expired" ? "Tempo esgotado" : "Pagamento cancelado"}
              </h1>
              <p className="max-w-sm text-base text-[#6a5b52]">
                {paymentStatus === "expired"
                  ? "O QR code PIX expirou. Volte ao carrinho para gerar um novo código."
                  : "Seu pedido foi cancelado. Caso queira tentar novamente, volte ao carrinho."}
              </p>
              <button
                type="button"
                onClick={() => { setStep("cart"); setPixData(null); setTimeLeft(PIX_TIMEOUT_SECONDS); }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary"
              >
                <IoArrowBack className="h-4 w-4" />
                Voltar ao carrinho
              </button>
            </div>
          ) : (
            <div className="w-full max-w-md space-y-6">
              <div className="text-center">
                <h1 className="font-display text-3xl font-extrabold text-text-h">
                  Pague com <span className="text-primary">PIX</span>
                </h1>
                <p className="mt-1 text-sm text-[#6a5b52]">
                  Escaneie o QR code ou copie o código para pagar
                </p>
              </div>

              {/* QR Code */}
              {pixData.pix_qr_base64 && (
                <div className="flex justify-center">
                  <div className="rounded-2xl border border-[#d5ccc2] bg-white p-4 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
                    <img
                      src={`data:image/png;base64,${pixData.pix_qr_base64}`}
                      alt="QR Code PIX"
                      className="h-52 w-52"
                    />
                  </div>
                </div>
              )}

              {/* Copia e cola */}
              <div className="rounded-2xl bg-[#f4f2f0] p-4 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9a7b6e]">
                  PIX Copia e Cola
                </p>
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate rounded-xl border border-[#d5ccc2] bg-white px-3 py-2 font-mono text-xs text-text-h">
                    {pixData.pix_qr_code}
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex-shrink-0 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-contrast transition-colors hover:bg-secondary"
                  >
                    {copied ? <IoCheckmarkCircleOutline className="h-4 w-4" /> : <IoCopyOutline className="h-4 w-4" />}
                  </button>
                </div>
                {copied && (
                  <p className="mt-1.5 text-center text-xs font-medium text-green-600">
                    Código copiado!
                  </p>
                )}
              </div>

              {/* Total e status */}
              <div className="rounded-2xl bg-[#f4f2f0] p-4 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[#6a5b52]">Total a pagar</span>
                  <span className="font-extrabold text-primary">{formatBRL(total)}</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#9a7b6e]">
                  <IoTimeOutline className="h-4 w-4 animate-pulse" />
                  <span>Aguardando confirmação do pagamento...</span>
                </div>
                {/* Cronômetro regressivo */}
                <div className="mt-3 flex flex-col items-center gap-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#b8a89e]">
                    QR code válido por
                  </p>
                  <span
                    className={`font-mono text-2xl font-extrabold tabular-nums transition-colors ${
                      timeLeft <= 60 ? "text-red-500" : timeLeft <= 120 ? "text-orange-500" : "text-text-h"
                    }`}
                  >
                    {formatCountdown(timeLeft)}
                  </span>
                  {timeLeft <= 60 && (
                    <p className="text-[10px] font-medium text-red-500">
                      Quase expirando — finalize o pagamento!
                    </p>
                  )}
                </div>
              </div>

              <p className="text-center text-[10px] text-[#c4b4aa]">
                Você receberá um e-mail em {customerEmail} quando o pagamento for confirmado.
              </p>
            </div>
          )}
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
                <div className="mt-3 space-y-3">
                  <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 text-sm text-[#6a5b52]">
                    <p className="font-semibold text-text-h">Donna Lupe</p>
                    <p className="text-xs">Centro Acdo. C.A.A.S.O. - R. Dr. Carlos de Camargo Salles - Parque Arnold Schimidt, São Carlos - SP</p>
                    <p className="mt-1 text-xs">Funcionamento: seg–sex 10h–18h · sáb 10h–14h</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-[#9a7b6e]">
                      Horário de Retirada * (formato 24h)
                    </label>
                    <select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full rounded-xl border border-[#d5ccc2] bg-white px-3 py-2 text-sm text-text-h focus:border-primary focus:outline-none"
                    >
                      <option value="">Selecione um horário</option>
                      {PICKUP_TIMES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-[#c4b4aa]">Disponível entre 10:00 e 18:00 (seg–sex) ou 10:00–14:00 (sáb).</p>
                  </div>
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
                  <p className="mt-2 text-center text-xs font-medium text-primary">{freightError}</p>
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

            {/* Dados do cliente */}
            <div className="rounded-2xl bg-[#f4f2f0] p-5 shadow-[0_4px_16px_rgba(38,20,11,0.08)]">
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-text-h">
                Seus dados
              </h2>
              <div className="space-y-2.5">
                <Field
                  label="Nome *"
                  value={customerName}
                  onChange={setCustomerName}
                  placeholder="Maria da Silva"
                />
                <Field
                  label="E-mail *"
                  value={customerEmail}
                  onChange={setCustomerEmail}
                  placeholder="maria@email.com"
                  inputMode="email"
                />
              </div>
              <p className="mt-2 text-[10px] text-[#c4b4aa]">
                Você receberá a confirmação do pagamento neste e-mail.
              </p>
            </div>

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
                  <span>{deliveryMode === "pickup" ? "Retirada" : "Frete"}</span>
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
                  <span className="text-xl font-extrabold text-primary">{formatBRL(total)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkoutLoading || !canCheckout}
                title={!canCheckout ? "Preencha seus dados e calcule o frete para continuar" : undefined}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-contrast transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkoutLoading ? "Gerando PIX..." : "Pagar com PIX"}
              </button>

              {checkoutError && (
                <p className="mt-2 text-center text-xs font-medium text-primary">{checkoutError}</p>
              )}

              <p className="mt-3 text-center text-[10px] text-[#c4b4aa]">
                Pagamento processado via Mercado Pago · Apenas PIX
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
        src={resolveProductImage(item.img)}
        alt={item.name}
        className="h-20 w-20 flex-shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-subtitle text-xs font-bold italic text-secondary">{item.subtitle}</p>
            <h3 className="font-display text-lg font-extrabold leading-tight text-text-h sm:text-xl">
              {item.name}
            </h3>
            <p className="text-xs text-[#9a7b6e]">{item.weight} · {item.price}/un</p>
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
            <span className="w-8 text-center text-sm font-bold text-text-h">{item.quantity}</span>
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
