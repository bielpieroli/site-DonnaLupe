import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/core/Button";
import Input from "@/components/core/Input";
import Card from "@/components/core/Card";
import Notification from "@/components/Notification";
import { LockKeyhole, ShieldCheck } from "lucide-react";

type LocationState = {
  from?: { pathname?: string };
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | null;
  const destination = state?.from?.pathname ?? "/home";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Preencha e-mail e senha para continuar.");
      return;
    }

    setLoading(true);
    const msg = await login(email, password);
    setLoading(false);

    if (msg) {
      setErrorMessage(msg);
      return;
    }
    navigate(destination, { replace: true });
  };

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return (
    <section className="relative flex min-h-[calc(100vh-73px)] items-center justify-center overflow-hidden px-4 py-12">
      {/* Background Decorativo */}
      <div className="absolute -left-1/4 top-0 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
      <div className="absolute -right-1/4 bottom-0 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />

      {/* Container Principal  */}
      <Card className="relative grid w-full max-w-5xl gap-0 overflow-hidden rounded-3xl border p-0 md:grid-cols-[1fr_0.9fr]">
        
        {/* Lado Esquerdo: Branding/Info */}
        <div className="relative flex flex-col justify-between bg-login-hero p-8 text-white md:p-12">
          <div className="space-y-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/12 text-white ring-1 ring-white/20">
              <ShieldCheck size={28} />
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/75">Acesso Restrito</p>
              <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
                DonnaLupe <span className="mt-2 block text-3xl font-medium text-primary-contrast underline decoration-accent/70 underline-offset-8 md:text-4xl">Backoffice</span>
              </h1>
            </div>
            
            <p className="max-w-[320px] text-lg leading-relaxed text-primary-contrast/85">
              Gerenciamento centralizado e seguro dos dados da loja de doces DonnaLupe.
            </p>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-white/75">
            <div className="h-2 w-2 animate-pulse rounded-full bg-primary-contrast" />
            Toda sessão é monitorada visando à segurança e integridade dos dados.
          </div>
        </div>

        {/* Lado Direito: Formulário */}
        <div className="flex flex-col justify-center bg-surface">
          <div className="p-8 pb-0 md:p-12 md:pb-0">
            <h2 className="text-2xl font-bold text-text-h">Bem-vindo de volta</h2>
            <p className="mt-1 text-muted">
              Insira suas credenciais administrativas
            </p>
          </div>

          <div className="p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-text">E-mail</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="nome@exemplo.com"
                  className="h-12 px-4"
                />
              </div>

              <div className="space-y-2">
                <label className="ml-1 text-sm font-medium text-text">Senha</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="h-12 px-4"
                />
                <div className="flex justify-end px-1">
                  <a href="#" className="text-xs text-secondary hover:underline">Esqueceu a senha?</a>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="group relative h-12 w-full overflow-hidden rounded-xl font-semibold active:scale-[0.98] disabled:opacity-60"
              >
                <span className="flex items-center gap-2">
                  {loading ? "Entrando…" : "Acessar Painel"}
                  <LockKeyhole size={18} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
            </form>

            <p className="mt-8 text-center text-xs text-muted">
              &copy; {new Date().getFullYear()} DonnaLupe - Todos os direitos reservados.
            </p>
          </div>
        </div>
      </Card>

      <Notification
        message={errorMessage}
        type="warning"
        visible={Boolean(errorMessage)}
        onClose={() => setErrorMessage("")}
      />
    </section>
  );
}