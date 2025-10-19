import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import { categoryService } from "../services/categoryService";
import type {
  AccommodationDetail,
  AccommodationImage,
} from "../types/accommodation";
import type { Category } from "../types/category";
import LoadingSpinner from "../components/LoadingSpinner";
import FavoriteButton from "../components/FavoriteButton";

export default function AccommodationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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

        // Check if we have accommodation data from navigation state
        const stateAccommodation = location.state?.accommodation;

        if (stateAccommodation) {
          // Use data from navigation state
          setAccommodation(stateAccommodation);

          // Load categories
          const categoriesResponse = await categoryService.getCategories({
            page: 1,
            pageSize: 100,
          });
          setCategories(categoriesResponse.data);

          // Set images from state data
          if (
            stateAccommodation.images &&
            stateAccommodation.images.length > 0
          ) {
            setImages(stateAccommodation.images);
          } else {
            // Fallback if no images
            setImages([
              {
                linkId: 1,
                mediaId: 1,
                isCover: true,
                position: 0,
                url: stateAccommodation.thumbnailUrl || "/default-avatar.svg",
                altText: stateAccommodation.name || "Nơi nghỉ",
                caption: "Ảnh chính của nơi nghỉ",
              },
            ]);
          }
        } else {
          // Fallback to API call if no state data
          const [accommodationResponse, categoriesResponse] = await Promise.all(
            [
              accommodationService.getAccommodationById(parseInt(id)),
              categoryService.getCategories({ page: 1, pageSize: 100 }),
            ]
          );

          // API response structure: accommodationResponse has data directly, not accommodationResponse.data
          const accommodationData =
            (accommodationResponse as { data?: AccommodationDetail }).data ||
            accommodationResponse;
          setAccommodation(accommodationData);
          setCategories(categoriesResponse.data);

          // Set images from API response
          if (
            accommodationData?.images &&
            accommodationData.images.length > 0
          ) {
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
        }
      } catch (error) {
        console.error("Error loading accommodation detail:", error);
        setError("Không thể tải thông tin nơi nghỉ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, location.state]);

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
              onClick={() => navigate("/accommodations")}
              className="hover:text-ocean-600 cursor-pointer"
            >
              Nơi nghỉ
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
            {accommodation && (
              <FavoriteButton
                targetType={4} // Accommodation
                targetId={accommodation.id}
                className="!bg-ocean-600 !text-white hover:!bg-ocean-700"
              />
            )}
          </div>
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

                {/* Star Rating */}
                {accommodation.star && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Xếp hạng
                    </h4>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${
                            i < accommodation.star!
                              ? "text-yellow-400"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                      <span className="text-sm text-gray-600 ml-2">
                        {accommodation.star} sao
                      </span>
                    </div>
                  </div>
                )}

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
