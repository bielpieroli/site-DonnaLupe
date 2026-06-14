import { Navigate, createBrowserRouter } from "react-router-dom";
import App from "@/App";
import HomePage from "@/pages/Home";
import LoginPage from "@/pages/Login";
import BackofficeUsers from "@/pages/UserBackoffice";
import RequireAuth from "@/lib/RequireAuth";
import RequirePermission from "@/lib/RequirePermission";
import ProductsPage from "@/pages/Products";
import PermissionsPage from "@/pages/PermissionsBackoffice";
import LandingPage from "@/pages/LandingPageBackoffice";
import FreightPage from "@/pages/FreightBackoffice";
import OrdersPage from "@/pages/OrdersBackoffice";
import DeliveriesPage from "@/pages/DeliveriesBackoffice";

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
            element: <RequirePermission resource="products" />,
            children: [{ path: "/products", element: <ProductsPage /> }],
          },
          {
            element: <RequirePermission resource="users" />,
            children: [{ path: "/backoffice-users", element: <BackofficeUsers /> }],
          },
          {
            element: <RequirePermission resource="permissions" />,
            children: [{ path: "/backoffice-permissions", element: <PermissionsPage /> }],
          },
          {
            element: <RequirePermission resource="landing" />,
            children: [{ path: "/backoffice-landing", element: <LandingPage /> }],
          },
          {
            element: <RequirePermission resource="freight" />,
            children: [{ path: "/backoffice-freight", element: <FreightPage /> }],
          },
          {
            element: <RequirePermission resource="orders" />,
            children: [
              { path: "/backoffice-orders", element: <OrdersPage /> },
              { path: "/backoffice-deliveries", element: <DeliveriesPage /> },
            ],
          },
        ],
      },
    ],
  },
]);
