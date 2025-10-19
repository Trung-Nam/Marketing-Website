import { createBrowserRouter } from "react-router-dom";
import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorBoundary from "../components/ErrorBoundary";

const Home = () => import("../pages/Home");
const Register = () => import("../pages/Register");
const Profile = () => import("../pages/Profile");
const AdminDashboard = () => import("../pages/AdminDashboard");

// Promotion Pages
const ArticlesPage = () => import("../pages/ArticlesPage");
const ArticleDetail = () => import("../pages/ArticleDetail");
const AccommodationsPage = () => import("../pages/AccommodationsPage");
const AccommodationDetail = () => import("../pages/AccommodationDetail");
const EventsPage = () => import("../pages/EventsPage");
const EventDetail = () => import("../pages/EventDetail");
const PlacesPage = () => import("../pages/PlacesPage");
const PlaceDetail = () => import("../pages/PlaceDetail");
const RestaurantsPage = () => import("../pages/RestaurantsPage");
const RestaurantDetail = () => import("../pages/RestaurantDetail");
const ToursPage = () => import("../pages/ToursPage");
const TourDetail = () => import("../pages/TourDetail");
const FavoritesPage = () => import("../pages/FavoritesPage");

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
          const mod = await ArticlesPage();
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
      // Promotion Pages
      {
        path: "accommodations",
        async lazy() {
          const mod = await AccommodationsPage();
          return { Component: mod.default };
        },
      },
      {
        path: "accommodations/:id",
        async lazy() {
          const mod = await AccommodationDetail();
          return { Component: mod.default };
        },
      },
      {
        path: "events",
        async lazy() {
          const mod = await EventsPage();
          return { Component: mod.default };
        },
      },
      {
        path: "events/:id",
        async lazy() {
          const mod = await EventDetail();
          return { Component: mod.default };
        },
      },
      {
        path: "places",
        async lazy() {
          const mod = await PlacesPage();
          return { Component: mod.default };
        },
      },
      {
        path: "places/:id",
        async lazy() {
          const mod = await PlaceDetail();
          return { Component: mod.default };
        },
      },
      {
        path: "restaurants",
        async lazy() {
          const mod = await RestaurantsPage();
          return { Component: mod.default };
        },
      },
      {
        path: "restaurants/:id",
        async lazy() {
          const mod = await RestaurantDetail();
          return { Component: mod.default };
        },
      },
      {
        path: "tours",
        async lazy() {
          const mod = await ToursPage();
          return { Component: mod.default };
        },
      },
      {
        path: "tours/:id",
        async lazy() {
          const mod = await TourDetail();
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
      {
        path: "favorites",
        async lazy() {
          const mod = await FavoritesPage();
          return { Component: mod.default };
        },
      },
    ],
  },
]);

export function Fallback() {
  return <LoadingSpinner label="Đang tải trang..." />;
}
