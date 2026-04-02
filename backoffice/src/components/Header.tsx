import { useLayoutEffect, useEffect, useState, useRef } from "react";
import { IoMenu, IoClose } from "react-icons/io5";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/core/Button";
import { LogOut } from "lucide-react";
import BrandLogo from "@/assets/img/brand/logo.jpg";
import { Tabs } from "@/constants/Tabs";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Referência para o primeiro item do menu para focar ao abrir
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Gerenciamento de Overflow e Auto-foco ao abrir o menu
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
      
      // Move o foco para o primeiro link do menu após a renderização
      const timer = setTimeout(() => {
        firstNavLinkRef.current?.focus();
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  // Fechar menu com a tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : "";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-(--border) bg-[color-mix(in_oklab,var(--surface)_90%,white_10%)]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          
          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-lg"
                onClick={() => setIsMenuOpen(v => !v)}
                aria-expanded={isMenuOpen}
                aria-controls="main-navigation"
                aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              >
                {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
              </Button>
            )}

            <Link to="/home" className="flex items-center gap-3 group transition ">
              <img src={BrandLogo} alt="Brand Logo" className="w-8 h-8 rounded-full transition group-hover:contrast-70" />
              <div className="hidden sm:block group-hover:scale-105 transition">
                <p className="text-[10px] uppercase leading-none tracking-[0.35em] text-(--muted)">Backoffice</p>
                <h1 className="font-comfortaa text-sm leading-tight tracking-wide text-(--text-h)">Ludogs</h1>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && (
              <>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-(--primary) text-xs font-bold text-(--primary-contrast) shadow-lg shadow-[color-mix(in_oklab,var(--primary)_30%,transparent)]">
                    {initials}
                  </div>
                  <div className="hidden md:flex flex-col">
                    <span className="text-xs font-medium leading-none text-(--text)">{user?.name ?? "Admin"}</span>
                    <span className="mt-1 text-[10px] italic uppercase tracking-wider text-(--muted)">{user?.email}</span>
                  </div>
                </div>

                <div className="mx-1 hidden h-4 w-px bg-(--border) md:block" />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Sair</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/35 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <aside
            id="main-navigation"
            role="dialog"
            aria-modal="true"
            className="fixed left-0 top-0 z-50 flex h-full w-70 flex-col border-r border-(--border) bg-(--surface) shadow-2xl"
          >
            <nav
              aria-label="Navegação Principal"
              className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-hide"
            >
              {Tabs.map((tab, index) => (
                <NavLink
                  key={tab.key}
                  to={tab.pageNavigate}
                  // Define a ref apenas para o primeiro item para o auto-foco funcionar
                  ref={index === 0 ? firstNavLinkRef : null}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-start gap-4 px-4 py-4 rounded-xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-(--primary) ${
                      isActive
                        ? "border border-[color-mix(in_oklab,var(--primary)_40%,transparent)] bg-[color-mix(in_oklab,var(--primary)_12%,transparent)] text-(--primary)"
                        : "border border-transparent text-(--muted) hover:bg-[color-mix(in_oklab,var(--secondary)_15%,transparent)] hover:text-(--text)"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span 
                        className={`rounded-lg p-2 ${isActive ? "bg-[color-mix(in_oklab,var(--primary)_15%,transparent)] text-(--primary)" : "bg-[color-mix(in_oklab,var(--secondary)_20%,transparent)] text-(--muted)"}`} 
                        aria-hidden="true"
                      >
                        {tab.icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{tab.label}</p>
                        <p className="mt-0.5 text-[11px] leading-tight text-(--muted)">{tab.description}</p>
                      </div>
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="shrink-0 border-t border-(--border) p-6 text-center text-[10px] uppercase tracking-widest text-(--muted)">
                Ludogs - Backoffice
            </div>
          </aside>
        </>
      )}
    </>
  );
}