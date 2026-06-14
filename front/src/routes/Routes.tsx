import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "@/pages/Home";
import ShoppingPage from "@/pages/Shopping";
import AboutPage from "@/pages/About";
import CoffeePage from "@/pages/Coffee";
import CartPage from "@/pages/Cart";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "/",         element: <HomePage /> },
      { path: "/shopping", element: <ShoppingPage /> },
      { path: "/about",    element: <AboutPage /> },
      { path: "/coffee",   element: <CoffeePage /> },
      { path: "/cart",     element: <CartPage /> },
    ],
  },
]);