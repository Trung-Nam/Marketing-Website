import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { restaurantService } from "../services/restaurantService";
import type { RestaurantDetail } from "../types/restaurant";
import LoadingSpinner from "../components/LoadingSpinner";
import { getRestaurantCoverImageInfo } from "../utils/restaurantUtils";

export default function RestaurantDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<RestaurantDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    alt: string;
    caption?: string;
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError("Không tìm thấy nhà hàng");
          return;
        }

        const restaurantResponse = await restaurantService.getRestaurantById(
          parseInt(id)
        );
        setRestaurant(restaurantResponse);
      } catch (error) {
        console.error("Error loading restaurant detail:", error);
        setError("Không thể tải thông tin nhà hàng");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const openLightbox = (url: string, alt: string, caption?: string) => {
    setLightboxImage({ url, alt, caption });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const getCategoryName = (): string => {
    return restaurant?.category?.name || "Khác";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy nhà hàng"}
          </h1>
          <button
            onClick={() => navigate("/restaurants")}
            className="text-ocean-600 hover:text-ocean-700 font-medium"
          >
            ← Quay lại danh sách nhà hàng
          </button>
        </div>
      </div>
    );
  }

  const coverInfo = getRestaurantCoverImageInfo(restaurant);
  const coverUrl = coverInfo.url;
  const coverAlt = coverInfo.alt;
  const coverCaption = coverInfo.caption;
  const gallery = (restaurant.images ?? []).sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-6 pb-12">
      {/* Breadcrumb + Share (Top) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <button
              onClick={() => navigate("/restaurants")}
              className="hover:text-ocean-600 transition-colors"
            >
              Nhà hàng
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{restaurant.name}</span>
          </nav>

          {/* Share Buttons */}
          <div className="flex items-center space-x-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
              Chia sẻ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg shadow-sm hover:bg-ocean-700 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clipRule="evenodd"
                />
              </svg>
              Yêu thích
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover */}
        {coverUrl && (
          <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
            <button
              onClick={() => openLightbox(coverUrl, coverAlt, coverCaption)}
              className="group relative w-full h-[380px] md:h-[480px] overflow-hidden"
            >
              <img
                src={coverUrl}
                alt={coverAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  <p className="text-lg font-semibold">Click để xem ảnh</p>
                </div>
              </div>
            </button>
            {coverCaption && (
              <div className="px-4 py-2 text-sm text-gray-600 bg-white text-center text-italic">
                {coverCaption}
              </div>
            )}
          </div>
        )}

        {/* Content + Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 bg-ocean-100 text-ocean-800 text-sm font-medium rounded-full">
                  {getCategoryName()}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">
                  {formatDate(restaurant.createdAt)}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-500">Nhà hàng</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {restaurant.name}
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                {restaurant.summary}
              </p>
            </div>

            {/* Content */}
            {restaurant.content && (
              <div className="mb-8">
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: restaurant.content }}
                />
              </div>
            )}

            {/* Gallery */}
            {gallery.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hình ảnh
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {gallery.map((image) => (
                    <button
                      key={image.linkId}
                      onClick={() =>
                        openLightbox(
                          image.url,
                          image.altText || restaurant.name,
                          image.caption
                        )
                      }
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={image.url}
                        alt={image.altText || restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin nhà hàng
              </h3>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Danh mục</h4>
                  <span className="inline-block px-3 py-1 bg-ocean-100 text-ocean-800 rounded-full text-sm font-medium">
                    {getCategoryName()}
                  </span>
                </div>

                {/* Price Range */}
                {restaurant.priceRangeText && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Khoảng giá
                    </h4>
                    <p className="text-lg font-bold text-ocean-600">
                      {restaurant.priceRangeText}
                    </p>
                  </div>
                )}

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Địa chỉ</h4>
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="text-gray-700">{restaurant.address}</p>
                  </div>
                </div>

                {/* Phone */}
                {restaurant.phone && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Điện thoại
                    </h4>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <a
                        href={`tel:${restaurant.phone}`}
                        className="text-ocean-600 hover:text-ocean-700 font-medium"
                      >
                        {restaurant.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {restaurant.website && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Website
                    </h4>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-gray-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <a
                        href={restaurant.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ocean-600 hover:text-ocean-700 font-medium"
                      >
                        Truy cập website
                      </a>
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ngày tạo</h4>
                  <p className="text-gray-700">
                    {formatDate(restaurant.createdAt)}
                  </p>
                </div>

                {/* Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Trạng thái
                  </h4>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      restaurant.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {restaurant.isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 transition-colors">
                  Đặt bàn
                </button>
                <button className="w-full border border-ocean-600 text-ocean-600 py-3 px-4 rounded-lg font-semibold hover:bg-ocean-50 transition-colors">
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeLightbox}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.alt}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {lightboxImage.caption && (
              <p className="text-center italic text-white mt-4">
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
