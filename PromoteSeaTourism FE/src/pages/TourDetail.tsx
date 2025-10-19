import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourService } from "../services/tourService";
import type { TourDetail as TourDetailType } from "../types/tour";
import LoadingSpinner from "../components/LoadingSpinner";
import FavoriteButton from "../components/FavoriteButton";
import { getTourCoverImageInfo, getOtherTourImages } from "../utils/tourUtils";

const TourDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadTourDetail(parseInt(id));
    }
  }, [id]);

  const loadTourDetail = async (tourId: number) => {
    try {
      setLoading(true);
      const response = await tourService.getTourById(tourId);
      setTour(response);
    } catch (error) {
      console.error("Error loading tour detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Không tìm thấy tour
          </h2>
          <button
            onClick={() => navigate("/tours")}
            className="px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            Quay lại danh sách tour
          </button>
        </div>
      </div>
    );
  }

  const coverInfo = getTourCoverImageInfo(tour);
  const otherImages = getOtherTourImages(tour);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="text-gray-500">
              <button
                onClick={() => navigate(-1)}
                className="hover:text-ocean-600 cursor-pointer"
              >
                ← Quay lại
              </button>
              <span className="mx-2">/</span>
              <button
                onClick={() => navigate("/tours")}
                className="hover:text-ocean-600 cursor-pointer"
              >
                Tours
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
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
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                  />
                </svg>
                Chia sẻ
              </button>
              {tour && (
                <FavoriteButton
                  targetType={6} // Tour
                  targetId={tour.id}
                  className="!bg-ocean-600 !text-white hover:!bg-ocean-700"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Image */}
            <div className="relative">
              <img
                src={coverInfo.url}
                alt={coverInfo.alt}
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
                loading="lazy"
              />
              {coverInfo.caption && (
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white p-3 rounded-lg">
                  <p className="text-sm">{coverInfo.caption}</p>
                </div>
              )}
            </div>

            {/* Category */}
            {tour.category && (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-ocean-100 text-ocean-800 text-sm font-medium rounded-full">
                  {tour.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {tour.name}
            </h1>

            {/* Summary */}
            {tour.summary && (
              <div className="bg-blue-50 p-6 rounded-2xl">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Tổng quan
                </h2>
                <p className="text-gray-700 leading-relaxed">{tour.summary}</p>
              </div>
            )}

            {/* Description */}
            {tour.description && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Mô tả chi tiết
                </h2>
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tour.description }}
                />
              </div>
            )}

            {/* Itinerary */}
            {tour.itinerary && (
              <div className="bg-gray-50 p-6 rounded-2xl">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Lịch trình
                </h2>
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: tour.itinerary }}
                />
              </div>
            )}

            {/* Other Images */}
            {otherImages.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Hình ảnh khác
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {otherImages.map((image, index) => (
                    <div
                      key={index}
                      className="relative group cursor-pointer"
                      onClick={() => setLightboxImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={image.altText || `Tour image ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-lg flex items-center justify-center">
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
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Booking Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-ocean-600 mb-2">
                    {formatPrice(tour.priceFrom)}
                  </div>
                  <div className="text-gray-600">Giá cho mỗi người</div>
                </div>

                <button className="w-full bg-ocean-600 text-white py-4 rounded-lg font-semibold hover:bg-ocean-700 transition-colors mb-4">
                  Đặt tour ngay
                </button>

                <div className="text-center text-sm text-gray-500">
                  Miễn phí hủy trong 24h
                </div>
              </div>

              {/* Tour Information */}
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin tour
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá:</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(tour.priceFrom)}
                    </span>
                  </div>

                  {tour.category && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại:</span>
                      <span className="font-semibold text-gray-900">
                        {tour.category.name}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-semibold text-gray-900">
                      {formatDate(tour.createdAt)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-semibold ${
                        tour.isPublished ? "text-green-600" : "text-gray-600"
                      }`}
                    >
                      {tour.isPublished ? "Đang hoạt động" : "Tạm dừng"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={lightboxImage}
              alt="Lightbox"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <svg
                className="w-6 h-6"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default TourDetail;
