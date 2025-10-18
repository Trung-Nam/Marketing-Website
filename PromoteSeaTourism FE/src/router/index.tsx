import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";

const Home = () => import("../pages/Home");
const Register = () => import("../pages/Register");
const Profile = () => import("../pages/Profile");
const Articles = () => import("../pages/Articles");
const ArticleDetail = () => import("../pages/ArticleDetail");
const AdminDashboard = () => import("../pages/AdminDashboard");

export const router = createBrowserRouter([
  {
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    children: [
      {
        index: true,
        async lazy() {
          const mod = await Home();
          return { Component: mod.default };
        },
      },
      {
        path: "register",
        async lazy() {
          const mod = await Register();
          return { Component: mod.default };
        },
      },
      {
        path: "articles",
        async lazy() {
          const mod = await Articles();
          return { Component: mod.default };
        },
      },
      {
        path: "articles/:id",
        async lazy() {
          const mod = await ArticleDetail();
          return { Component: mod.default };
        },
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "profile",
            async lazy() {
              const mod = await Profile();
              return { Component: mod.default };
            },
          },
        ],
      },
      {
        element: <ProtectedRoute roles={["Admin"]} />,
        children: [
          {
            path: "admin",
            async lazy() {
              const mod = await AdminDashboard();
              return { Component: mod.default };
            },
          },
        ],
      },
    ],
  },
]);

export function Fallback() {
  return <LoadingSpinner label="Đang tải trang..." />;
}
