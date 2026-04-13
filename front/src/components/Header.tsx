import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IoMenu, IoClose } from "react-icons/io5";
import Logo from "@/assets/img/logo.png";
import { tabs } from "@/constants/Tabs";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const activeTab = tabs.find((t) => t.path === location.pathname)?.key || "home";

  // Lógica de distribuição para Desktop
  const leftTabs = tabs.filter((_, i) => (i + 1) % 2 !== 0);
  const rightTabs = tabs.filter((_, i) => (i + 1) % 2 === 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary-contrast shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between relative w-[70%]">
        
        {/* MOBILE: Botão Menu */}
        <button 
          className="xl:hidden text-primary text-3xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <IoClose /> : <IoMenu />}
        </button>

        {/* (Ímpares) */}
        <nav className="hidden xl:flex flex-1 justify-start pr-20 gap-8">
          {leftTabs.map((tab) => (
            <NavLink key={tab.key} tab={tab} isActive={activeTab === tab.key} />
          ))}
        </nav>

        {/* LOGO CENTRAL */}
        <div className="absolute left-1/2 -translate-x-1/2 z-20 top-3/4 -translate-y-1/2">
          <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-primary-contrast shadow-lg flex items-center justify-center">
            <img src={Logo} alt="Logo" className="w-3/4 h-3/4 object-contain" />
          </div>
        </div>

        {/* (Pares) */}
        <nav className="hidden xl:flex flex-1 justify-end pl-20 gap-8">
          {rightTabs.map((tab) => (
            <NavLink key={tab.key} tab={tab} isActive={activeTab === tab.key} />
          ))}
        </nav>

        

        {/* MENU MOBILE DROP DOWN */}
        {isOpen && (
          <div className="fixed top-20 left-0 w-screen bg-primary-contrast border-b border-border flex flex-col p-4 gap-4 xl:hidden shadow-xl animate-in slide-in-from-top">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-bold ${activeTab === tab.key ? "text-primary" : "text-text"}`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

function NavLink({ tab, isActive }: { tab: any; isActive: boolean }) {
  return (
    <Link
      to={tab.path}
      className={`relative text-lg font-bold tracking-widest transition-all ${
        isActive ? "text-primary scale-105" : "text-text hover:text-primary hover:scale-105"
      }`}
    >
      {tab.label}
      {isActive && (
        <span 
        className={`absolute -bottom-2 left-0 h-1 bg-primary transition-all duration-300 rounded-full ${
          isActive ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
      )}
    </Link>
  );
}