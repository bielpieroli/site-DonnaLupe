export type TabKey = "cart" | "shopping" | "about" | "home" | "profile" | "coffee";


// Tabs como array de Tabkey
export const tabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "Home", path: "/" },

  { key: "about", label: "About", path: "/about" },

  { key: "shopping", label: "Shopping", path: "/shopping" },
  { key: "coffee", label: "Coffee", path: "/coffee" },

  { key: "cart", label: "Cart", path: "/cart" },

  { key: "profile", label: "Profile", path: "/profile" },
];