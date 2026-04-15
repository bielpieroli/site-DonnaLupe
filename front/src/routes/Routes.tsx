// import dos componentes para as paginas
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "@/pages/Home";
import ShoppingPage from "@/pages/Shopping";
import AboutPage from "@/pages/About";
import CoffeePage from "@/pages/Coffee";

// criação do router
export const router = createBrowserRouter([
  {
    path: "/", // path base onde iremos reenderizar outras paginas dentro dessa pagina 
    element: <App />,
    children: [ // paths das paginas filhas que serão reenderizadas dentro de app
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/shopping",
        element: <ShoppingPage />,
      },
      {
        path: "/about",
        element: <AboutPage />,
      },
      {
        path: "/coffee",
        element: <CoffeePage />,
      }
    ],
  },
]);