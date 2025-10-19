import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import ErrorBoundary from "../components/ErrorBoundary";
import { routes } from "./routes";

const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      // Public routes
      ...routes.filter(
        (route) => !["profile", "admin", "favorites"].includes(route.path || "")
      ),
      // Protected routes
      {
        element: <ProtectedRoute />,
        children: [...routes.filter((route) => route.path === "profile")],
      },
      {
        element: <ProtectedRoute roles={["Admin"]} />,
        children: [...routes.filter((route) => route.path === "admin")],
      },
      // Favorites route (no protection needed based on current setup)
      ...routes.filter((route) => route.path === "favorites"),
    ],
  },
]);

function Fallback() {
  return <div>Loading...</div>;
}

export { router, Fallback };
