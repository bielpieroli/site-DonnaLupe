import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import BackofficeUsers from "@/pages/UserBackoffice";
import RequireAuth from "@/lib/RequireAuth";
import ProductsPage from "@/pages/Products";
import PermissionsPage from "@/pages/PermissionsBackoffice";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to="/home" replace />,
      },
      {
        element: <LoginPage />,
        path: "/login",
      },
      {
        element: <RequireAuth />,
        children: [
          {
            path: "/home",
            element: <HomePage />,
          },
          {
            path: "/products",
            element: <ProductsPage />,
          },
          {
            path: "/backoffice-users",
            element: <BackofficeUsers />,
          },
          {
            path: "/backoffice-permissions",
            element: <PermissionsPage />,
          },
        ],
      },
    ],
  },
]);
