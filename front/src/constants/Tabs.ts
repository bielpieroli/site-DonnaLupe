export type TabKey = "cart" | "shopping" | "about" | "home" | "profile" | "coffee";


// Tabs como array de Tabkey
export const tabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "Início", path: "/" },

  { key: "about", label: "Sobre", path: "/about" },

  { key: "shopping", label: "Compras", path: "/shopping" },
  { key: "coffee", label: "Coffee", path: "/coffee" },

 
];