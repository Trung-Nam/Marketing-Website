import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tourService } from "../services/tourService";
import { TourDetail } from "../types/tour";
import LoadingSpinner from "../components/LoadingSpinner";
import { getTourCoverImageInfo, getOtherTourImages } from "../utils/tourUtils";

const TourDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tour, setTour] = useState<TourDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (id) {
      loadTourDetail();
    }
  }, [id]);

  const loadTourDetail = async () => {
    try {
      setLoading(true);
      const response = await tourService.getTourById(parseInt(id!));
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

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (tour && selectedImageIndex !== null) {
      const totalImages = tour.images?.length || 0;
      setSelectedImageIndex((selectedImageIndex + 1) % totalImages);
    }
  };

  const prevImage = () => {
    if (tour && selectedImageIndex !== null) {
      const totalImages = tour.images?.length || 0;
      setSelectedImageIndex(
        selectedImageIndex === 0 ? totalImages - 1 : selectedImageIndex - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <button
                onClick={() => navigate("/tours")}
                className="hover:text-gray-700 transition-colors"
              >
                Tours
              </button>
              <span>/</span>
              <span className="text-gray-900">{tour.name}</span>
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
              <button className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Yêu thích
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cover Image */}
            {coverInfo.url && (
              <div className="mb-8">
                <div className="relative rounded-2xl overflow-hidden shadow-lg">
                  <img
                    src={coverInfo.url}
                    alt={coverInfo.alt}
                    loading="lazy"
                    className="w-full h-96 object-cover cursor-pointer"
                    onClick={() => openLightbox(0)}
                  />
                </div>
                {coverInfo.caption && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {coverInfo.caption}
                  </p>
                )}
              </div>
            )}

            {/* Main Info */}
            <div className="mb-8">
              {/* Category and Date */}
              <div className="flex items-center gap-3 mb-4">
                {tour.category && (
                  <span className="px-3 py-1 bg-ocean-50 text-ocean-700 text-sm font-medium rounded-full">
                    {tour.category.name}
                  </span>
                )}
                <span className="text-sm text-gray-500">
                  {formatDate(tour.createdAt)} • Tour
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {tour.name}
              </h1>

              {/* Summary */}
              <p className="text-lg text-gray-700 mb-6">{tour.summary}</p>

              {/* Description */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {tour.description}
                </p>
              </div>
            </div>

            {/* Itinerary */}
            {tour.itinerary && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Lịch trình chi tiết
                </h2>
                <div className="bg-gray-50 rounded-2xl p-6">
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {tour.itinerary}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Other Images */}
            {otherImages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Hình ảnh
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {otherImages.map((image, index) => (
                    <div
                      key={image.linkId}
                      className="relative rounded-lg overflow-hidden shadow-md cursor-pointer group"
                      onClick={() => openLightbox(index + 1)}
                    >
                      <img
                        src={image.url}
                        alt={image.altText}
                        loading="lazy"
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
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
            <div className="sticky top-8">
              {/* Tour Info */}
              <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Thông tin tour
                </h3>
                <div className="space-y-4">
                  {tour.category && (
                    <div>
                      <span className="text-sm text-gray-500">Danh mục</span>
                      <div className="mt-1">
                        <span className="px-3 py-1 bg-ocean-50 text-ocean-700 text-sm font-medium rounded-full">
                          {tour.category.name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-sm text-gray-500">Khoảng giá</span>
                    <div className="mt-1">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(tour.priceFrom)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Ngày tạo</span>
                    <div className="mt-1">
                      <span className="text-gray-900">
                        {formatDate(tour.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-gray-500">Trạng thái</span>
                    <div className="mt-1">
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                        Đã xuất bản
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <button className="w-full bg-ocean-600 hover:bg-ocean-700 text-white font-bold py-4 px-6 rounded-lg transition-colors">
                  Đặt tour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {selectedImageIndex !== null && tour.images && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
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

          {tour.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          <div className="max-w-4xl max-h-full">
            <img
              src={tour.images[selectedImageIndex].url}
              alt={tour.images[selectedImageIndex].altText}
              className="max-w-full max-h-full object-contain"
            />
            {tour.images[selectedImageIndex].caption && (
              <div className="text-center mt-4">
                <p className="text-white">
                  {tour.images[selectedImageIndex].caption}
                </p>
              </div>
            )}
          </div>

          {tour.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
              <span>
                {selectedImageIndex + 1} / {tour.images.length}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TourDetailPage;
