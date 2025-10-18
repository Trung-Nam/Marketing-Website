import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import { categoryService } from "../services/categoryService";
import type {
  AccommodationDetail,
  AccommodationImage,
} from "../types/accommodation";
import type { Category } from "../types/category";
import LoadingSpinner from "../components/LoadingSpinner";

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] =
    useState<AccommodationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<AccommodationImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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
          setError("Không tìm thấy nơi nghỉ");
          return;
        }

        const [accommodationResponse, categoriesResponse] = await Promise.all([
          accommodationService.getAccommodationById(parseInt(id)),
          categoryService.getCategories({ page: 1, pageSize: 100 }),
        ]);

        // API response structure: accommodationResponse has data directly, not accommodationResponse.data
        const accommodationData =
          (accommodationResponse as { data?: AccommodationDetail }).data ||
          accommodationResponse;
        setAccommodation(accommodationData);
        setCategories(categoriesResponse.data);

        // Set images from API response
        if (accommodationData?.images && accommodationData.images.length > 0) {
          setImages(accommodationData.images);
        } else {
          // Fallback if no images
          setImages([
            {
              linkId: 1,
              mediaId: 1,
              isCover: true,
              position: 0,
              url: "/default-avatar.svg",
              altText: accommodationData?.name || "Nơi nghỉ",
              caption: "Ảnh chính của nơi nghỉ",
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading accommodation detail:", error);
        setError("Không thể tải thông tin nơi nghỉ");
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (price: number | undefined | null) => {
    if (!price || isNaN(price)) {
      return "Liên hệ";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "Khác";
  };

  const getAccommodationType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      hotel: "Khách sạn",
      resort: "Resort",
      homestay: "Homestay",
      villa: "Villa",
      apartment: "Căn hộ",
    };
    return typeMap[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy nơi nghỉ"}
          </h1>
          <button
            onClick={() => navigate("/accommodations")}
            className="text-ocean-600 hover:text-ocean-700 font-medium"
          >
            ← Quay lại danh sách nơi nghỉ
          </button>
        </div>
      </div>
    );
  }

  const coverImage = images.find((img) => img.isCover) || images[0];
  const featuredImages = images.filter((img) => !img.isCover);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          {/* Back Button */}
          <button
            onClick={() => navigate("/accommodations")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
            <span>Quay lại</span>
            <span>/</span>
            <span>Nơi nghỉ</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white py-16 px-8 rounded-2xl">
          <div className="absolute inset-0 bg-black/20 rounded-2xl"></div>
          <div className="relative">
            {/* Category Badge and Metadata */}
            <div className="flex items-center gap-4 mb-6">
              <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full">
                {getCategoryName(accommodation.categoryId)}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">
                {formatDate(accommodation.createdAt)}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">Nơi nghỉ</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {accommodation.name}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover Image */}
        {coverImage && (
          <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
            <button
              onClick={() =>
                openLightbox(
                  coverImage.url,
                  coverImage.altText || accommodation.name,
                  coverImage.caption
                )
              }
              className="group relative w-full h-[380px] md:h-[480px] overflow-hidden"
            >
              <img
                src={coverImage.url}
                alt={coverImage.altText || accommodation.name}
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
            {coverImage.caption && (
              <div className="px-4 py-2 text-sm text-gray-600 bg-white text-center text-italic">
                {coverImage.caption}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Summary */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Giới thiệu
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {accommodation.summary}
              </p>
            </div>

            {/* Content */}
            {accommodation.content && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chi tiết
                </h2>
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: accommodation.content }}
                />
              </div>
            )}

            {/* Featured Images */}
            {featuredImages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Hình ảnh nổi bật
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {featuredImages.map((image) => (
                    <button
                      key={image.linkId}
                      onClick={() =>
                        openLightbox(
                          image.url,
                          image.altText || accommodation.name,
                          image.caption
                        )
                      }
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={image.url}
                        alt={image.altText || accommodation.name}
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
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Thông tin nơi nghỉ
              </h3>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Danh mục</h4>
                  <span className="inline-block px-3 py-1 bg-ocean-100 text-ocean-800 rounded-full text-sm font-medium">
                    {getCategoryName(accommodation.categoryId)}
                  </span>
                </div>

                {/* Type */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Loại hình
                  </h4>
                  <p className="text-gray-700">
                    {getAccommodationType(accommodation.type)}
                  </p>
                </div>

                {/* Price */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Giá</h4>
                  <p className="text-red-600 font-bold text-lg">
                    {formatPrice(accommodation.minPrice)}
                  </p>
                  {accommodation.maxPrice &&
                    accommodation.maxPrice !== accommodation.minPrice && (
                      <p className="text-sm text-red-500 font-semibold">
                        Đến {formatPrice(accommodation.maxPrice)}
                      </p>
                    )}
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Địa chỉ</h4>
                  <p className="text-gray-700">{accommodation.address}</p>
                  {accommodation.province && (
                    <p className="text-sm text-gray-500 mt-1">
                      {accommodation.ward && `${accommodation.ward}, `}
                      {accommodation.district && `${accommodation.district}, `}
                      {accommodation.province}
                    </p>
                  )}
                </div>

                {/* Contact Info */}
                {accommodation.phone && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Điện thoại
                    </h4>
                    <p className="text-gray-700">{accommodation.phone}</p>
                  </div>
                )}

                {accommodation.email && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Email</h4>
                    <p className="text-gray-700">{accommodation.email}</p>
                  </div>
                )}

                {accommodation.website && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Website
                    </h4>
                    <a
                      href={accommodation.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ocean-600 hover:text-ocean-700"
                    >
                      {accommodation.website}
                    </a>
                  </div>
                )}

                {/* Amenities */}
                {accommodation.amenities &&
                  accommodation.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Tiện nghi
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {accommodation.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Created Date */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ngày tạo</h4>
                  <p className="text-gray-700">
                    {formatDate(accommodation.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 transition-colors">
                  Chia sẻ
                </button>
                <button className="w-full border border-ocean-600 text-ocean-600 py-3 px-4 rounded-lg font-semibold hover:bg-ocean-50 transition-colors">
                  Lưu nơi nghỉ
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
