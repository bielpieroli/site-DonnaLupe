import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/core/Card";
import { ArrowRight } from "lucide-react";
import { Tabs } from "@/constants/Tabs";

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 md:py-10 space-y-8">
      {/* Bem-vindos banner */}
      <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-[linear-gradient(130deg,color-mix(in_oklab,var(--surface)_88%,white_12%),color-mix(in_oklab,var(--secondary)_18%,var(--surface)))] p-6 md:p-8">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] blur-3xl" />
					<div className="relative">
            <h2 className="mb-2 text-3xl font-semibold text-(--text-h) md:text-4xl">
							{greeting}, {user?.name?.split(" ")[0] ?? "Admin"} 👋
						</h2>
					</div>
            <p className="w-full text-justify text-base text-(--text)/85">
							Bem-vindo ao Backoffice da Ludogs! Aqui é o local em que gerenciamos todos os aspectos da organização da Loja de Doces Ludogs, desde o cadastro de produtos até a gestão de vendas e acesso ao sistema. Explore as seções abaixo ou pelo menu para começar a administrar os recursos do site e proporcionar uma experiência deliciosa no padrão Ludogs!
						</p>
      	</div>
    

      {/* CRUD cards */}
      <div className="grid md:grid-cols-3 gap-4">
      {Tabs.map((item, index) => {
        const Icon: React.ReactNode = item.icon;
        return (
          <Card
            key={index}
            className={`group cursor-pointer border-(--border) transition-all duration-300 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--primary)_45%,transparent)] focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:outline-none`}
            onClick={() => navigate(item.pageNavigate)}
            
            // --- ACESSIBILIDADE ---
            tabIndex={0} // Permite focar com a tecla Tab
            role="link" // Indica que o card age como um link de navegação
            aria-label={`Acessar ${item.label}`} // Melhora a leitura para cegos
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate(item.pageNavigate);
              }
            }}
          >
            <div className="px-5 pt-5 pb-3">
              <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} text-(--primary) transition-colors group-hover:${item.hoverBg}`} aria-hidden="true">
                {Icon}
              </div>
              <h3 className="text-base font-semibold text-(--text-h)">{item.label}</h3>
              <p className="text-sm text-(--muted)">{item.description}</p>
            </div>
            <div className="px-5 pb-5">
              <div className={`flex items-center gap-1.5 text-xs font-medium text-(--primary)`} aria-hidden="true">
                Acessar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
    </section>
  );

}