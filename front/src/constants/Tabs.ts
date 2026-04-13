export type TabKey = "cart" | "shopping" | "about" | "home" | "profile";


// Tabs como array de Tabkey
export const tabs: Array<{ key: TabKey; label: string; path: string }> = [
  { key: "home", label: "Home", path: "/" },
  { key: "cart", label: "Cart", path: "/cart" },
  { key: "about", label: "About", path: "/about" },
  { key: "profile", label: "Profile", path: "/profile" },
  { key: "shopping", label: "Shopping", path: "/shopping" },
];