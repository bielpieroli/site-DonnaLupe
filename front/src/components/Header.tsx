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
  const leftTabs = tabs.filter((_, i) => i < tabs.length +2);
  //const rightTabs = tabs.filter((_, i) => i >= tabs.length - 2);

  return (
    <header className="sticky top-0 z-50 w-full bg-primary-contrast shadow-sm">
      <div className="relative h-20 flex items-center w-full">
        {/* Botão menu sempre à esquerda */}
        <div className="absolute left-0 top-0 h-full flex items-center pl-4 z-30 2xl:hidden">
          <button
            className="text-primary text-3xl"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>

        {/* Container das tabs */}
        <div className="mx-auto w-[70%] h-full flex items-center justify-between relative">
          {/* Esquerdo */}
          <nav className="hidden 2xl:flex flex-1 justify-start pr-20 gap-8">
            {leftTabs.map((tab) => (
              <NavLink key={tab.key} tab={tab} isActive={activeTab === tab.key} />
            ))}
          </nav>

          {/* LOGO CENTRAL */}
          <div className="absolute left-1/2 -translate-x-1/2 z-20 top-3/4 -translate-y-1/2">
            <div className="w-30 h-30 lg:w-40 lg:h-40 rounded-full bg-primary-contrast shadow-lg flex items-center justify-center">
              <img src={Logo} alt="Logo" className="w-5/6 h-full object-contain" />
            </div>
          </div>

          {/* Direito */}
          {/* <nav className="hidden 2xl:flex flex-1 justify-end pl-20 gap-8">
            {rightTabs.map((tab) => (
              <NavLink key={tab.key} tab={tab} isActive={activeTab === tab.key} />
            ))}
          </nav> */}
        </div>

        {/* MENU MOBILE DROP DOWN */}
        {isOpen && (
          <div className="fixed top-20 left-0 w-full bg-primary-contrast flex flex-col p-4 2xl:hidden shadow-xl animate-in slide-in-from-top">
            {tabs.map((tab, index) => (
              <div className={` p-4 rounded-lg ${index % 2 === 0 ? "bg-secondary-contrast/5" : "bg-primary-contrast/50"}`} key={tab.key}>
              <Link
                key={tab.key}
                to={tab.path}
                onClick={() => setIsOpen(false)}
                className={`text-lg font-bold w-full block ${activeTab === tab.key ?  "text-primary" : "text-text"}`}
              >
                {tab.label}
              </Link>
              </div>
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
        className={`absolute -bottom-2 left-0 h-1 bg-primary transition-all ounded-full ${
          isActive ? "w-full opacity-100" : "w-0 opacity-0"
        }`}
      />
      )}
    </Link>
  );

}