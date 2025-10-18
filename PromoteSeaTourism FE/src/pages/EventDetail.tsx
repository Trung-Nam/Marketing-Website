import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService } from "../services/eventService";
import type { EventDetail, EventImage } from "../types/event";
import LoadingSpinner from "../components/LoadingSpinner";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<EventImage[]>([]);
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
          setError("Không tìm thấy sự kiện");
          return;
        }

        const eventResponse = await eventService.getEventById(parseInt(id));

        // API response structure: eventResponse has data directly, not eventResponse.data
        const eventData =
          (eventResponse as { data?: EventDetail }).data || eventResponse;
        setEvent(eventData);

        // Set images from API response
        if (eventData?.images && eventData.images.length > 0) {
          setImages(eventData.images);
        } else {
          // Fallback if no images
          setImages([
            {
              linkId: 1,
              mediaId: 1,
              isCover: true,
              position: 0,
              url: "/default-avatar.svg",
              altText: eventData?.title || "Sự kiện",
              caption: "Ảnh chính của sự kiện",
            },
          ]);
        }
      } catch (error) {
        console.error("Error loading event detail:", error);
        setError("Không thể tải thông tin sự kiện");
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "ended";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "ended":
        return "Đã kết thúc";
      default:
        return "Không xác định";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Không tìm thấy sự kiện"}
          </h1>
          <button
            onClick={() => navigate("/events")}
            className="text-ocean-600 hover:text-ocean-700 font-medium"
          >
            ← Quay lại danh sách sự kiện
          </button>
        </div>
      </div>
    );
  }

  const coverImage = images.find((img) => img.isCover) || images[0];
  const featuredImages = images.filter((img) => !img.isCover);
  const eventStatus = getEventStatus(event.startTime, event.endTime);

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center">
          {/* Back Button */}
          <button
            onClick={() => navigate("/events")}
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
            <span>Sự kiện</span>
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
                {event.category?.name || "Khác"}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">
                {formatDate(event.startTime)}
              </span>
              <span className="text-white/80">•</span>
              <span className="text-white/80">Sự kiện</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
              {event.title}
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
                  coverImage.altText || event.title,
                  coverImage.caption
                )
              }
              className="group relative w-full h-[380px] md:h-[480px] overflow-hidden"
            >
              <img
                src={coverImage.url}
                alt={coverImage.altText || event.title}
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
                {event.summary}
              </p>
            </div>

            {/* Content */}
            {event.content && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chi tiết
                </h2>
                <div
                  className="prose prose-lg max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: event.content }}
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
                          image.altText || event.title,
                          image.caption
                        )
                      }
                      className="group relative aspect-square overflow-hidden rounded-lg"
                    >
                      <img
                        src={image.url}
                        alt={image.altText || event.title}
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
                Thông tin sự kiện
              </h3>

              <div className="space-y-4">
                {/* Category */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Danh mục</h4>
                  <span className="inline-block px-3 py-1 bg-ocean-100 text-ocean-800 rounded-full text-sm font-medium">
                    {event.category?.name || "Khác"}
                  </span>
                </div>

                {/* Event Status */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Trạng thái
                  </h4>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      eventStatus
                    )}`}
                  >
                    {getStatusText(eventStatus)}
                  </span>
                </div>

                {/* Start Time */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thời gian bắt đầu
                  </h4>
                  <p className="text-gray-700">{formatDate(event.startTime)}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.startTime)}
                  </p>
                </div>

                {/* End Time */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Thời gian kết thúc
                  </h4>
                  <p className="text-gray-700">{formatDate(event.endTime)}</p>
                  <p className="text-sm text-gray-500">
                    {formatTime(event.endTime)}
                  </p>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Địa điểm</h4>
                  <p className="text-gray-700">{event.address}</p>
                  {event.place?.name && (
                    <p className="text-sm text-gray-500 mt-1">
                      {event.place.name}
                    </p>
                  )}
                </div>

                {/* Price Info */}
                {event.priceInfo && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Thông tin giá
                    </h4>
                    <p className="text-gray-700">{event.priceInfo}</p>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Ngày tạo</h4>
                  <p className="text-gray-700">{formatDate(event.createdAt)}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button className="w-full bg-ocean-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-ocean-700 transition-colors">
                  Chia sẻ
                </button>
                <button className="w-full border border-ocean-600 text-ocean-600 py-3 px-4 rounded-lg font-semibold hover:bg-ocean-50 transition-colors">
                  Lưu sự kiện
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
