import Header from "@/components/Header";
import { Outlet } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";

function App() {
  return (
    <CartProvider>
      <Header />
      <main className="w-full">
        <Outlet />
      </main>
    </CartProvider>
  );
}

export default App;
