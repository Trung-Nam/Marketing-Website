import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { categoryService } from "../services/categoryService";
import { articleService } from "../services/articleService";
import { accommodationService } from "../services/accommodationService";
import { eventService } from "../services/eventService";
import { placeService } from "../services/placeService";
import type { Category } from "../types/category";
import type { Article } from "../types/article";
import type { Accommodation } from "../types/accommodation";
import type { Event } from "../types/event";
import type { Place } from "../types/place";
import LoadingSpinner from "../components/LoadingSpinner";
import CategoryModal from "../components/CategoryModal";
import EditCategoryModal from "../components/EditCategoryModal";
import CreateArticleModal from "../components/CreateArticleModal";
import EditArticleModal from "../components/EditArticleModal";
import ViewArticleModal from "../components/ViewArticleModal";
import ViewAccommodationModal from "../components/ViewAccommodationModal";
import CreateAccommodationModal from "../components/CreateAccommodationModal";
import EditAccommodationModal from "../components/EditAccommodationModal";
import ViewEventModal from "../components/ViewEventModal";
import CreateEventModal from "../components/CreateEventModal";
import EditEventModal from "../components/EditEventModal";
import ViewPlaceModal from "../components/ViewPlaceModal";
import CreatePlaceModal from "../components/CreatePlaceModal";
import EditPlaceModal from "../components/EditPlaceModal";

type TabKey =
  | "articles"
  | "categories"
  | "accommodations"
  | "events"
  | "places"
  | "restaurants"
  | "tours";

const TABS: { key: TabKey; label: string }[] = [
  { key: "categories", label: "Categories" },
  { key: "articles", label: "Articles" },
  { key: "accommodations", label: "Accommodations" },
  { key: "events", label: "Events" },
  { key: "places", label: "Places" },
  { key: "restaurants", label: "Restaurants" },
  { key: "tours", label: "Tours" },
];

export default function AdminDashboard() {
  const [active, setActive] = useState<TabKey>("categories");

  // Categories state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesPage, setCategoriesPage] = useState(1);
  const [categoriesTotal, setCategoriesTotal] = useState(0);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Articles state
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesPage, setArticlesPage] = useState(1);
  const [articlesTotal, setArticlesTotal] = useState(0);
  const [articleCategories, setArticleCategories] = useState<Category[]>([]);
  const [showCreateArticleModal, setShowCreateArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [showEditArticleModal, setShowEditArticleModal] = useState(false);
  const [viewingArticle, setViewingArticle] = useState<Article | null>(null);
  const [showViewArticleModal, setShowViewArticleModal] = useState(false);

  // Accommodations state
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [accommodationsPage, setAccommodationsPage] = useState(1);
  const [accommodationsTotal, setAccommodationsTotal] = useState(0);
  const [viewingAccommodation, setViewingAccommodation] =
    useState<Accommodation | null>(null);
  const [showViewAccommodationModal, setShowViewAccommodationModal] =
    useState(false);
  const [showCreateAccommodationModal, setShowCreateAccommodationModal] =
    useState(false);
  const [editingAccommodation, setEditingAccommodation] =
    useState<Accommodation | null>(null);
  const [showEditAccommodationModal, setShowEditAccommodationModal] =
    useState(false);

  // Events state
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotal, setEventsTotal] = useState(0);
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null);
  const [showViewEventModal, setShowViewEventModal] = useState(false);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showEditEventModal, setShowEditEventModal] = useState(false);

  // Places state
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesPage, setPlacesPage] = useState(1);
  const [placesTotal, setPlacesTotal] = useState(0);
  const [viewingPlace, setViewingPlace] = useState<Place | null>(null);
  const [showViewPlaceModal, setShowViewPlaceModal] = useState(false);
  const [showCreatePlaceModal, setShowCreatePlaceModal] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [showEditPlaceModal, setShowEditPlaceModal] = useState(false);
  const [placeCategories, setPlaceCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(false);
  const pageSize = 20;

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await categoryService.getCategories({
        page: categoriesPage,
        pageSize,
      });
      setCategories(response.data);
      setCategoriesTotal(response.total);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Không thể tải danh sách categories!");
    } finally {
      setLoading(false);
    }
  }, [categoriesPage, pageSize]);

  const loadArticles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await articleService.getArticles({
        page: articlesPage,
        pageSize,
      });
      setArticles(response.data);
      setArticlesTotal(response.total);
    } catch (error) {
      console.error("Error loading articles:", error);
    } finally {
      setLoading(false);
    }
  }, [articlesPage, pageSize]);

  const loadArticleCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      setArticleCategories(response.data);
    } catch (error) {
      console.error("Error loading categories for articles:", error);
    }
  };

  const getCategoryName = (categoryId: number) => {
    const category = articleCategories.find((cat) => cat.id === categoryId);
    return category ? category.name : `ID: ${categoryId}`;
  };

  const handleCreateArticleSuccess = () => {
    loadArticles();
  };

  const handleEditArticle = (article: Article) => {
    setEditingArticle(article);
    setShowEditArticleModal(true);
  };

  const handleEditArticleSuccess = () => {
    loadArticles();
  };

  const handleViewArticle = (article: Article) => {
    setViewingArticle(article);
    setShowViewArticleModal(true);
  };

  const handleDeleteArticle = async (article: Article) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col gap-2">
        <p className="font-medium">
          Bạn có chắc muốn xóa bài viết "{article.title}"?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(confirmToast);
              performDeleteArticle(article);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const performDeleteArticle = async (article: Article) => {
    setLoading(true);
    try {
      await articleService.deleteArticle(article.id);
      loadArticles(); // Reload the list
      toast.success("Xóa bài viết thành công!");
    } catch (error) {
      console.error("Error deleting article:", error);
      toast.error("Xóa bài viết thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Accommodations functions
  const loadAccommodations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await accommodationService.getAccommodations({
        page: accommodationsPage,
        pageSize,
      });
      setAccommodations(response.data);
      setAccommodationsTotal(response.total);
    } catch (error) {
      console.error("Error loading accommodations:", error);
      toast.error("Không thể tải danh sách accommodations!");
    } finally {
      setLoading(false);
    }
  }, [accommodationsPage, pageSize]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await eventService.getEvents({
        page: eventsPage,
        pageSize,
      });
      setEvents(response.data);
      setEventsTotal(response.total);
    } catch (error) {
      console.error("Error loading events:", error);
      toast.error("Không thể tải danh sách events!");
    } finally {
      setLoading(false);
    }
  }, [eventsPage, pageSize]);

  const loadPlaces = useCallback(async () => {
    setLoading(true);
    try {
      const response = await placeService.getPlaces({
        page: placesPage,
        pageSize,
      });
      setPlaces(response.data);
      setPlacesTotal(response.total);
    } catch (error) {
      console.error("Error loading places:", error);
      toast.error("Không thể tải danh sách places!");
    } finally {
      setLoading(false);
    }
  }, [placesPage, pageSize]);

  const loadPlaceCategories = useCallback(async () => {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      setPlaceCategories(response.data);
    } catch (error) {
      console.error("Error loading place categories:", error);
    }
  }, []);

  const getPlaceCategoryName = useCallback(
    (categoryId: number) => {
      const category = placeCategories.find((cat) => cat.id === categoryId);
      return category ? category.name : `Category ${categoryId}`;
    },
    [placeCategories]
  );

  const handleDeleteAccommodation = (accommodation: Accommodation) => {
    const confirmToast = toast(
      <div className="p-4">
        <div className="text-gray-800 mb-3 font-medium">
          Bạn có chắc chắn muốn xóa accommodation "{accommodation.name}"?
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              performDeleteAccommodation(accommodation);
              toast.dismiss(confirmToast);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: "bg-white border border-gray-200 rounded-lg shadow-lg",
      }
    );
  };

  const performDeleteAccommodation = async (accommodation: Accommodation) => {
    setLoading(true);
    try {
      await accommodationService.deleteAccommodation(accommodation.id);
      loadAccommodations(); // Reload the list
      toast.success("Xóa accommodation thành công!");
    } catch (error) {
      console.error("Error deleting accommodation:", error);
      toast.error("Xóa accommodation thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlace = (place: Place) => {
    const confirmToast = toast(
      <div className="p-4">
        <div className="text-gray-800 mb-3 font-medium">
          Bạn có chắc chắn muốn xóa place "{place.name}"?
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              performDeletePlace(place);
              toast.dismiss(confirmToast);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        className: "bg-white text-gray-800 border border-gray-200 shadow-lg",
        closeButton: false,
        autoClose: false,
        draggable: false,
      }
    );
  };

  const performDeletePlace = async (place: Place) => {
    setLoading(true);
    try {
      await placeService.deletePlace(place.id);
      loadPlaces(); // Reload the list
      toast.success("Xóa place thành công!");
    } catch (error) {
      console.error("Error deleting place:", error);
      toast.error("Xóa place thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAccommodation = (accommodation: Accommodation) => {
    setViewingAccommodation(accommodation);
    setShowViewAccommodationModal(true);
  };

  const handleCreateAccommodationSuccess = () => {
    loadAccommodations();
  };

  const handleEditAccommodation = (accommodation: Accommodation) => {
    setEditingAccommodation(accommodation);
    setShowEditAccommodationModal(true);
  };

  const handleEditAccommodationSuccess = () => {
    loadAccommodations();
  };

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event);
    setShowViewEventModal(true);
  };

  const handleCreateEventSuccess = () => {
    loadEvents();
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setShowEditEventModal(true);
  };

  const handleEditEventSuccess = () => {
    loadEvents();
  };

  const handleDeleteEvent = async (event: Event) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col gap-2">
        <p className="font-medium">
          Bạn có chắc muốn xóa event "{event.title}"?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(confirmToast);
              performDeleteEvent(event);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const performDeleteEvent = async (event: Event) => {
    try {
      await eventService.deleteEvent(event.id);
      toast.success("Xóa event thành công!");
      loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      // Error message is already shown by axios interceptor
    }
  };

  const handleViewPlace = (place: Place) => {
    setViewingPlace(place);
    setShowViewPlaceModal(true);
  };

  const handleCreatePlaceSuccess = () => {
    loadPlaces();
  };

  const handleEditPlace = (place: Place) => {
    setEditingPlace(place);
    setShowEditPlaceModal(true);
  };

  const handleEditPlaceSuccess = () => {
    loadPlaces();
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = async (category: Category) => {
    // Show confirmation toast
    const confirmToast = toast(
      <div className="flex flex-col gap-2">
        <p className="font-medium">
          Bạn có chắc muốn xóa category "{category.name}"?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss(confirmToast);
              performDelete(category);
            }}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Xóa
          </button>
          <button
            onClick={() => toast.dismiss(confirmToast)}
            className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
          >
            Hủy
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const performDelete = async (category: Category) => {
    setLoading(true);
    try {
      await categoryService.deleteCategory(category.id);
      loadCategories(); // Reload the list
      toast.success("Xóa category thành công!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Xóa category thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Load data when tab is active
  useEffect(() => {
    if (active === "categories") {
      loadCategories();
    } else if (active === "articles") {
      loadArticles();
      loadArticleCategories();
    } else if (active === "accommodations") {
      loadAccommodations();
    } else if (active === "events") {
      loadEvents();
    } else if (active === "places") {
      loadPlaces();
      loadPlaceCategories();
    }
  }, [
    active,
    categoriesPage,
    articlesPage,
    accommodationsPage,
    eventsPage,
    placesPage,
    loadCategories,
    loadArticles,
    loadAccommodations,
    loadEvents,
    loadPlaces,
    loadPlaceCategories,
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Quản trị nội dung và dữ liệu hệ thống
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          {/* Tabs */}
          <div className="border-b border-gray-200 px-4">
            <nav className="-mb-px flex flex-wrap gap-3" aria-label="Tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className={
                    (active === tab.key
                      ? "border-ocean-600 text-ocean-700"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300") +
                    " whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium"
                  }
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-4 md:p-6">
            {active === "articles" && (
              <Section title="Articles">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      Quản lý danh sách bài viết. Tổng cộng: {articlesTotal} bài
                      viết
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={loadArticles}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowCreateArticleModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      >
                        Tạo bài viết
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Articles List */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tiêu đề
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Trạng thái
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Ngày tạo
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {articles.map((article) => (
                                <tr
                                  key={article.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {article.id}
                                  </td>
                                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                    <div
                                      className="truncate"
                                      title={article.title}
                                    >
                                      {article.title}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {article.slug}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {getCategoryName(article.categoryId)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        article.isPublished
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {article.isPublished
                                        ? "Published"
                                        : "Draft"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(
                                      article.createdAt
                                    ).toLocaleDateString("vi-VN")}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          handleViewArticle(article)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        View
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleEditArticle(article)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteArticle(article)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {articlesTotal > pageSize && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing {(articlesPage - 1) * pageSize + 1} to{" "}
                            {Math.min(articlesPage * pageSize, articlesTotal)}{" "}
                            of {articlesTotal} articles
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setArticlesPage((prev) => Math.max(1, prev - 1))
                              }
                              disabled={articlesPage === 1}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm bg-ocean-600 text-white rounded-md">
                              {articlesPage}
                            </span>
                            <button
                              onClick={() =>
                                setArticlesPage((prev) => prev + 1)
                              }
                              disabled={
                                articlesPage * pageSize >= articlesTotal
                              }
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}

            {active === "accommodations" && (
              <Section title="Accommodations">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      Quản lý danh sách accommodations. Tổng cộng:{" "}
                      {accommodationsTotal} accommodations
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={loadAccommodations}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowCreateAccommodationModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      >
                        Tạo Accommodation
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Star
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price Range
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {accommodations.map((accommodation) => (
                              <tr
                                key={accommodation.id}
                                className="hover:bg-gray-50"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {accommodation.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {accommodation.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {accommodation.slug}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                  {accommodation.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {accommodation.star
                                    ? `⭐ ${accommodation.star}`
                                    : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {accommodation.minPrice.toLocaleString()} -{" "}
                                  {accommodation.maxPrice.toLocaleString()} VNĐ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      accommodation.isPublished
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {accommodation.isPublished
                                      ? "Published"
                                      : "Draft"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() =>
                                        handleViewAccommodation(accommodation)
                                      }
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleEditAccommodation(accommodation)
                                      }
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteAccommodation(accommodation)
                                      }
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {accommodationsTotal > pageSize && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(accommodationsPage - 1) * pageSize + 1} to{" "}
                        {Math.min(
                          accommodationsPage * pageSize,
                          accommodationsTotal
                        )}{" "}
                        of {accommodationsTotal} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setAccommodationsPage((prev) =>
                              Math.max(1, prev - 1)
                            )
                          }
                          disabled={accommodationsPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm bg-ocean-600 text-white rounded-md">
                          {accommodationsPage}
                        </span>
                        <button
                          onClick={() =>
                            setAccommodationsPage((prev) => prev + 1)
                          }
                          disabled={
                            accommodationsPage * pageSize >= accommodationsTotal
                          }
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {active === "events" && (
              <Section title="Events">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      Quản lý danh sách events. Tổng cộng: {eventsTotal} events
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={loadEvents}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowCreateEventModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      >
                        Tạo Event
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Start Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                End Time
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {events.map((event) => (
                              <tr key={event.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {event.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {event.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {event.summary}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(event.startTime).toLocaleString(
                                    "vi-VN"
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {new Date(event.endTime).toLocaleString(
                                    "vi-VN"
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {event.address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {event.priceInfo}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      event.isPublished
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {event.isPublished ? "Published" : "Draft"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewEvent(event)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleEditEvent(event)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(event)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {eventsTotal > pageSize && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(eventsPage - 1) * pageSize + 1} to{" "}
                        {Math.min(eventsPage * pageSize, eventsTotal)} of{" "}
                        {eventsTotal} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setEventsPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={eventsPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm bg-ocean-600 text-white rounded-md">
                          {eventsPage}
                        </span>
                        <button
                          onClick={() => setEventsPage((prev) => prev + 1)}
                          disabled={eventsPage * pageSize >= eventsTotal}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {active === "places" && (
              <Section title="Places">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      Quản lý danh sách places. Tổng cộng: {placesTotal} places
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={loadPlaces}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowCreatePlaceModal(true)}
                        className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                      >
                        Tạo Place
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Address
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Best Season
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Category
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {places.map((place) => (
                              <tr key={place.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {place.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  <div className="flex items-center">
                                    {place.thumbnailUrl && (
                                      <img
                                        src={place.thumbnailUrl}
                                        alt={place.name}
                                        loading="lazy"
                                        className="w-10 h-10 rounded-lg object-cover mr-3"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                                        }}
                                      />
                                    )}
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {place.name}
                                      </div>
                                      <div className="text-gray-500 text-xs">
                                        {place.slug}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900">
                                  <div>
                                    <div>{place.address}</div>
                                    {place.province && (
                                      <div className="text-gray-500 text-xs">
                                        {place.province}
                                        {place.district &&
                                          `, ${place.district}`}
                                        {place.ward && `, ${place.ward}`}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {place.bestSeason}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {getPlaceCategoryName(place.categoryId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      place.isPublished
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {place.isPublished ? "Published" : "Draft"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleViewPlace(place)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                      </svg>
                                      View
                                    </button>
                                    <button
                                      onClick={() => handleEditPlace(place)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                        />
                                      </svg>
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDeletePlace(place)}
                                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3 h-3 mr-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                      Delete
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Pagination */}
                  {placesTotal > pageSize && (
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-700">
                        Showing {(placesPage - 1) * pageSize + 1} to{" "}
                        {Math.min(placesPage * pageSize, placesTotal)} of{" "}
                        {placesTotal} results
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setPlacesPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={placesPage === 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm bg-ocean-600 text-white rounded-md">
                          {placesPage}
                        </span>
                        <button
                          onClick={() => setPlacesPage((prev) => prev + 1)}
                          disabled={placesPage * pageSize >= placesTotal}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {active === "categories" && (
              <Section title="Categories">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      Quản lý danh sách categories. Tổng cộng: {categoriesTotal}{" "}
                      categories
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={loadCategories}
                        className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 rounded-lg bg-ocean-600 text-white hover:bg-ocean-700"
                      >
                        Tạo Category
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Categories List */}
                      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Tên
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {categories.map((category) => (
                                <tr
                                  key={category.id}
                                  className="hover:bg-gray-50"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {category.id}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {category.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.slug}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {category.type}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        category.isActive
                                          ? "bg-green-100 text-green-800"
                                          : "bg-red-100 text-red-800"
                                      }`}
                                    >
                                      {category.isActive
                                        ? "Active"
                                        : "Inactive"}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() =>
                                          toast.info(
                                            "Category không có thông tin chi tiết để xem!"
                                          )
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        View
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleEditCategory(category)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-ocean-600 hover:bg-ocean-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                          />
                                        </svg>
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteCategory(category)
                                        }
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                      >
                                        <svg
                                          className="w-3 h-3 mr-1"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                          />
                                        </svg>
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {categoriesTotal > pageSize && (
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Showing {(categoriesPage - 1) * pageSize + 1} to{" "}
                            {Math.min(
                              categoriesPage * pageSize,
                              categoriesTotal
                            )}{" "}
                            of {categoriesTotal} results
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setCategoriesPage((prev) =>
                                  Math.max(1, prev - 1)
                                )
                              }
                              disabled={categoriesPage === 1}
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Previous
                            </button>
                            <span className="px-3 py-1 text-sm bg-ocean-600 text-white rounded-md">
                              {categoriesPage}
                            </span>
                            <button
                              onClick={() =>
                                setCategoriesPage((prev) => prev + 1)
                              }
                              disabled={
                                categoriesPage * pageSize >= categoriesTotal
                              }
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Section>
            )}
            {active === "restaurants" && (
              <Section title="Restaurants">
                <Placeholder />
              </Section>
            )}
            {active === "tours" && (
              <Section title="Tours">
                <Placeholder />
              </Section>
            )}
          </div>
        </div>
      </div>

      {/* Create Category Modal */}
      <CategoryModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          loadCategories();
          toast.success("Tạo category thành công!");
        }}
      />

      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        category={editingCategory}
        onSuccess={() => {
          loadCategories();
        }}
      />

      <CreateArticleModal
        isOpen={showCreateArticleModal}
        onClose={() => setShowCreateArticleModal(false)}
        onSuccess={handleCreateArticleSuccess}
      />

      <EditArticleModal
        isOpen={showEditArticleModal}
        onClose={() => setShowEditArticleModal(false)}
        article={editingArticle}
        onSuccess={handleEditArticleSuccess}
      />

      <ViewArticleModal
        isOpen={showViewArticleModal}
        onClose={() => setShowViewArticleModal(false)}
        article={viewingArticle}
      />

      <ViewAccommodationModal
        isOpen={showViewAccommodationModal}
        onClose={() => setShowViewAccommodationModal(false)}
        accommodation={viewingAccommodation}
      />

      <CreateAccommodationModal
        isOpen={showCreateAccommodationModal}
        onClose={() => setShowCreateAccommodationModal(false)}
        onSuccess={handleCreateAccommodationSuccess}
      />

      <EditAccommodationModal
        isOpen={showEditAccommodationModal}
        onClose={() => {
          setShowEditAccommodationModal(false);
          setEditingAccommodation(null);
        }}
        accommodation={editingAccommodation}
        onSuccess={handleEditAccommodationSuccess}
      />

      <ViewEventModal
        isOpen={showViewEventModal}
        onClose={() => setShowViewEventModal(false)}
        event={viewingEvent}
      />

      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        onSuccess={handleCreateEventSuccess}
      />

      <ViewPlaceModal
        isOpen={showViewPlaceModal}
        onClose={() => setShowViewPlaceModal(false)}
        place={viewingPlace}
      />

      <CreatePlaceModal
        isOpen={showCreatePlaceModal}
        onClose={() => setShowCreatePlaceModal(false)}
        onSuccess={handleCreatePlaceSuccess}
      />

      <EditEventModal
        isOpen={showEditEventModal}
        onClose={() => setShowEditEventModal(false)}
        onSuccess={handleEditEventSuccess}
        event={editingEvent}
      />

      <EditPlaceModal
        isOpen={showEditPlaceModal}
        onClose={() => setShowEditPlaceModal(false)}
        onSuccess={handleEditPlaceSuccess}
        place={editingPlace}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Placeholder() {
  return (
    <div className="rounded-xl border border-dashed border-gray-300 p-6 text-gray-600">
      Khu vực quản trị sẽ được kết nối API và bảng dữ liệu sau.
    </div>
  );
}
