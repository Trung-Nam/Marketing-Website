import { lazy, Suspense } from "react";
import LoadingSpinner from "../components/LoadingSpinner";

const Home = lazy(() => import("../pages/Home"));
const Register = lazy(() => import("../pages/Register"));
const Profile = lazy(() => import("../pages/Profile"));
const AdminDashboard = lazy(() => import("../pages/AdminDashboard"));

// Promotion Pages
const ArticlesPage = lazy(() => import("../pages/ArticlesPage"));
const ArticleDetail = lazy(() => import("../pages/ArticleDetail"));
const AccommodationsPage = lazy(() => import("../pages/AccommodationsPage"));
const AccommodationDetail = lazy(() => import("../pages/AccommodationDetail"));
const EventsPage = lazy(() => import("../pages/EventsPage"));
const EventDetail = lazy(() => import("../pages/EventDetail"));
const PlacesPage = lazy(() => import("../pages/PlacesPage"));
const PlaceDetail = lazy(() => import("../pages/PlaceDetail"));
const RestaurantsPage = lazy(() => import("../pages/RestaurantsPage"));
const RestaurantDetail = lazy(() => import("../pages/RestaurantDetail"));
const ToursPage = lazy(() => import("../pages/ToursPage"));
const TourDetail = lazy(() => import("../pages/TourDetail"));
const FavoritesPage = lazy(() => import("../pages/FavoritesPage"));

export const routes = [
  {
    index: true,
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang chủ..." />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "register",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang đăng ký..." />}>
        <Register />
      </Suspense>
    ),
  },
  {
    path: "articles",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải trang bài viết..." />}
      >
        <ArticlesPage />
      </Suspense>
    ),
  },
  {
    path: "articles/:id",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải chi tiết bài viết..." />}
      >
        <ArticleDetail />
      </Suspense>
    ),
  },
  // Promotion Pages
  {
    path: "accommodations",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải trang nơi nghỉ..." />}
      >
        <AccommodationsPage />
      </Suspense>
    ),
  },
  {
    path: "accommodations/:id",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải chi tiết nơi nghỉ..." />}
      >
        <AccommodationDetail />
      </Suspense>
    ),
  },
  {
    path: "events",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang sự kiện..." />}>
        <EventsPage />
      </Suspense>
    ),
  },
  {
    path: "events/:id",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải chi tiết sự kiện..." />}
      >
        <EventDetail />
      </Suspense>
    ),
  },
  {
    path: "places",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải trang địa điểm..." />}
      >
        <PlacesPage />
      </Suspense>
    ),
  },
  {
    path: "places/:id",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải chi tiết địa điểm..." />}
      >
        <PlaceDetail />
      </Suspense>
    ),
  },
  {
    path: "restaurants",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải trang nhà hàng..." />}
      >
        <RestaurantsPage />
      </Suspense>
    ),
  },
  {
    path: "restaurants/:id",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải chi tiết nhà hàng..." />}
      >
        <RestaurantDetail />
      </Suspense>
    ),
  },
  {
    path: "tours",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang tour..." />}>
        <ToursPage />
      </Suspense>
    ),
  },
  {
    path: "tours/:id",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải chi tiết tour..." />}>
        <TourDetail />
      </Suspense>
    ),
  },
  {
    path: "profile",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang profile..." />}>
        <Profile />
      </Suspense>
    ),
  },
  {
    path: "admin",
    element: (
      <Suspense fallback={<LoadingSpinner label="Đang tải trang admin..." />}>
        <AdminDashboard />
      </Suspense>
    ),
  },
  {
    path: "favorites",
    element: (
      <Suspense
        fallback={<LoadingSpinner label="Đang tải trang yêu thích..." />}
      >
        <FavoritesPage />
      </Suspense>
    ),
  },
];

export function Fallback() {
  return <LoadingSpinner label="Đang tải trang..." />;
}
