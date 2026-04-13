import { useMemo, useState } from "react";
import HomePage from "@/pages/Home";
import CartPage from "@/pages/Cart";
import ShoppingPage from "@/pages/Shopping";
import AboutPage from "@/pages/About";
import Header from "@/components/Header";

type TabKey = "home" | "cart" | "shopping" | "about";

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "home", label: "HOME" },
  { key: "cart", label: "CART" },
  { key: "shopping", label: "SHOPPING" },
  { key: "about", label: "ABOUT" },
];

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const currentPage = useMemo(() => {
    switch (activeTab) {
      case "home":
        return <HomePage />;
      case "cart":
        return <CartPage />;
      case "shopping":
        return <ShoppingPage />;
      case "about":
        return <AboutPage />;
      // case "cronograma":
      //   return <CronogramaPage />;
      // case "login":
      //   return <LoginPage />;
      default:
        return null;
    }
  }, [activeTab]);

  return (
    <>
      <Header tabs={tabs} active={activeTab} onChange={(key: TabKey) => setActiveTab(key)} />
      <main className="w-full">{currentPage}</main>
    </>
  );
}

export default App;