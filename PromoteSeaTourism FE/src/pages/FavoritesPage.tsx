import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { favoriteService } from "../services/favoriteService";
import type { Favorite } from "../types/favorite";
import { TARGET_TYPE_NAMES } from "../types/favorite";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuthStore } from "../store/useAuthStore";

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      loadFavorites();
    } else {
      setError("Vui lòng đăng nhập để xem danh sách yêu thích.");
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await favoriteService.getFavorites();

      if (response && response.data) {
        // Handle different response formats
        if (Array.isArray(response.data)) {
          setFavorites(response.data);
        } else {
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } catch (error) {
      setError("Không thể tải danh sách yêu thích. Vui lòng thử lại sau.");
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const getFavoritesByType = (targetType: number): Favorite[] => {
    return favorites.filter(
      (favorite) => favorite.favoriteId.targetType === targetType
    );
  };

  const getAvailableTypes = (): {
    type: number;
    name: string;
    count: number;
  }[] => {
    const typeCounts = favorites.reduce((acc, favorite) => {
      const type = favorite.favoriteId.targetType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return Object.entries(typeCounts)
      .map(([type, count]) => ({
        type: parseInt(type),
        name:
          TARGET_TYPE_NAMES[parseInt(type) as keyof typeof TARGET_TYPE_NAMES] ||
          "Khác",
        count,
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getDisplayedFavorites = (): Favorite[] => {
    if (activeTab === "all") {
      return favorites;
    }
    return getFavoritesByType(parseInt(activeTab));
  };

  const getCoverImage = (favorite: Favorite): string => {
    const item = favorite.item as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    // Check if item has coverImage
    if (item && item.coverImage?.url) {
      return item.coverImage.url;
    }

    // Check if item has images array with cover image
    if (item && item.images && Array.isArray(item.images)) {
      const coverImage = item.images.find((img: any) => img.isCover); // eslint-disable-line @typescript-eslint/no-explicit-any
      if (coverImage?.url) {
        return coverImage.url;
      }
      // Use first image if no cover found
      if (item.images[0]?.url) {
        return item.images[0].url;
      }
    }

    // Fallback to random image based on targetType
    switch (favorite.favoriteId.targetType) {
      case 1: // Article
        return `https://picsum.photos/400/300?random=${item.id}`;
      case 2: // Event
        return `https://picsum.photos/400/300?random=${item.id + 100}`;
      case 3: // Restaurant
        return `https://picsum.photos/400/300?random=${item.id + 200}`;
      case 4: // Accommodation
        return `https://picsum.photos/400/300?random=${item.id + 300}`;
      case 5: // Place
        return `https://picsum.photos/400/300?random=${item.id + 400}`;
      case 6: // Tour
        return `https://picsum.photos/400/300?random=${item.id + 500}`;
      default:
        return "https://picsum.photos/400/300?random=1";
    }
  };

  const getDetailUrl = (favorite: Favorite): string => {
    const item = favorite.item;

    switch (favorite.favoriteId.targetType) {
      case 1: // Article
        return `/articles/${item.id}`;
      case 2: // Event
        return `/events/${item.id}`;
      case 3: // Restaurant
        return `/restaurants/${item.id}`;
      case 4: // Accommodation
        return `/accommodations/${item.id}`;
      case 5: // Place
        return `/places/${item.id}`;
      case 6: // Tour
        return `/tours/${item.id}`;
      default:
        return "#";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">
              Đang tải danh sách yêu thích...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="text-red-600 text-xl mb-4">Đã xảy ra lỗi</div>
            <div className="text-gray-600 mb-6">{error}</div>
            {isAuthenticated && (
              <button
                onClick={loadFavorites}
                className="px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
              >
                Tải lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-ocean-600 via-turquoise-500 to-cyan-500 relative">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-end space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <svg
                      className="w-12 h-12 text-ocean-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-white">
                  <h1 className="text-3xl font-bold mb-2">
                    Danh sách yêu thích
                  </h1>
                  <p className="text-white/90 text-lg">
                    {favorites.length} mục yêu thích của bạn
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 rounded-full transition-colors ${
                activeTab === "all"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Tất cả ({favorites.length})
            </button>
            {getAvailableTypes().map((typeInfo) => (
              <button
                key={typeInfo.type}
                onClick={() => setActiveTab(typeInfo.type.toString())}
                className={`px-6 py-3 rounded-full transition-colors ${
                  activeTab === typeInfo.type.toString()
                    ? "bg-ocean-600 text-white"
                    : "bg-white text-gray-700 hover:bg-ocean-50"
                }`}
              >
                {typeInfo.name} ({typeInfo.count})
              </button>
            ))}
          </div>

          {/* Favorites Grid */}
          {getDisplayedFavorites().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {activeTab === "all"
                  ? "Chưa có mục yêu thích nào"
                  : "Không có mục yêu thích trong danh mục này"}
              </div>
              {activeTab === "all" && (
                <div className="text-gray-400 text-sm mb-4">
                  Hãy thêm các bài viết, sự kiện, địa điểm vào yêu thích để xem
                  chúng ở đây.
                </div>
              )}
              <div className="space-y-2">
                <button
                  onClick={loadFavorites}
                  className="px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors text-sm mr-2"
                >
                  Test API Call
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {getDisplayedFavorites().map((favorite) => (
                <Link
                  key={`${favorite.favoriteId.targetType}-${favorite.favoriteId.targetId}`}
                  to={getDetailUrl(favorite)}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-200 flex flex-col md:flex-row"
                >
                  {/* Image */}
                  <div className="relative h-48 md:h-32 md:w-48 flex-shrink-0 overflow-hidden">
                    <img
                      src={getCoverImage(favorite)}
                      alt={
                        ("title" in favorite.item
                          ? favorite.item.title
                          : favorite.item.name) as string
                      }
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-ocean-600/90 text-white text-sm font-medium rounded-full">
                        {
                          TARGET_TYPE_NAMES[
                            favorite.favoriteId
                              .targetType as keyof typeof TARGET_TYPE_NAMES
                          ]
                        }
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className="px-3 py-1 bg-black/50 text-white text-sm font-medium rounded-full">
                        {formatDate(favorite.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors line-clamp-2">
                      {
                        ("title" in favorite.item
                          ? favorite.item.title
                          : favorite.item.name) as string
                      }
                    </h3>

                    {favorite.item.summary && (
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {favorite.item.summary}
                      </p>
                    )}

                    {favorite.item.address && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="truncate">
                          {favorite.item.address}
                        </span>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mt-4">
                      <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full w-fit">
                        {formatDate(favorite.createdAt)}
                      </span>
                      <div className="flex items-center gap-1 text-ocean-600">
                        <span className="font-medium">Xem chi tiết</span>
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FavoritesPage;
