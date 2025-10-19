import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { eventService } from "../services/eventService";
import { categoryService } from "../services/categoryService";
import { placeService } from "../services/placeService";
import type { Event, EventDetail } from "../types/event";
import type { Category } from "../types/category";
import type { Place } from "../types/place";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface ViewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

export default function ViewEventModal({
  isOpen,
  onClose,
  event,
}: ViewEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);

  const loadEventDetail = useCallback(async () => {
    if (!event) return;

    setLoading(true);
    try {
      const detail = await eventService.getEventById(event.id);
      setEventDetail(detail);
    } catch (error) {
      console.error("Error loading event detail:", error);
      toast.error("Không thể tải chi tiết event!");
    } finally {
      setLoading(false);
    }
  }, [event]);

  const loadCategories = useCallback(async () => {
    setCategoriesLoading(true);
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Không thể tải danh sách categories!");
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const loadPlaces = useCallback(async () => {
    setPlacesLoading(true);
    try {
      const response = await placeService.getPlaces({
        page: 1,
        pageSize: 100,
      });
      setPlaces(response.data);
    } catch (error) {
      console.error("Error loading places:", error);
      toast.error("Không thể tải danh sách places!");
    } finally {
      setPlacesLoading(false);
    }
  }, []);

  const getCategoryName = (category: any) => {
    if (!category) {
      return "Không có";
    }
    return category.name || "Unknown";
  };

  const getPlaceName = (place: any) => {
    if (!place) {
      return "Không có";
    }
    return place.name || "Không có";
  };

  // Load event detail, categories and places when modal opens
  useEffect(() => {
    if (isOpen && event) {
      loadEventDetail();
      loadCategories();
      loadPlaces();
    }
  }, [isOpen, event, loadEventDetail, loadCategories, loadPlaces]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEventDetail(null);
      setCategories([]);
      setPlaces([]);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem Chi Tiết Event"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : eventDetail ? (
          <div className="space-y-6 pr-2">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thông tin cơ bản
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">ID:</span>
                    <span className="ml-2 text-white font-medium">
                      {eventDetail.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tiêu đề:</span>
                    <p className="ml-2 text-white font-medium">
                      {eventDetail.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Slug:</span>
                    <span className="ml-2 text-white font-mono text-xs">
                      {eventDetail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Category:</span>
                    <span className="ml-2 text-white font-medium">
                      {getCategoryName(eventDetail.category)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Trạng thái:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        eventDetail.isPublished
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {eventDetail.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thông tin sự kiện
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Bắt đầu:</span>
                    <span className="ml-2 text-white">
                      {new Date(eventDetail.startTime).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Kết thúc:</span>
                    <span className="ml-2 text-white">
                      {new Date(eventDetail.endTime).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Địa chỉ:</span>
                    <span className="ml-2 text-white">
                      {eventDetail.address || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Giá:</span>
                    <span className="ml-2 text-white">
                      {eventDetail.priceInfo || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Place:</span>
                    <span className="ml-2 text-white">
                      {getPlaceName(eventDetail.place)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {eventDetail.summary && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Tóm tắt
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {eventDetail.summary}
                </p>
              </div>
            )}

            {/* Content */}
            {eventDetail.content && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Nội dung
                </h3>
                <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {eventDetail.content}
                </div>
              </div>
            )}

            {/* Images */}
            {eventDetail.images && eventDetail.images.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Hình ảnh
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {eventDetail.images.map((image, index) => (
                    <div key={image.linkId} className="relative group">
                      <img
                        src={image.url}
                        alt={image.altText || ""}
                        className="w-full h-32 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                        }}
                      />
                      {image.isCover && (
                        <span className="absolute top-2 right-2 px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded-full">
                          Bìa
                        </span>
                      )}
                      <div className="mt-2">
                        <div className="text-xs text-white/80 truncate">
                          {image.caption || "No caption"}
                        </div>
                        <div className="text-xs text-white/60 truncate">
                          {image.altText || "No alt text"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Thumbnail */}
            {eventDetail.thumbnailUrl && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thumbnail
                </h3>
                <div className="flex justify-center">
                  <img
                    src={eventDetail.thumbnailUrl}
                    alt="Thumbnail"
                    className="w-48 h-36 object-cover rounded-lg shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='192' height='144' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                Thông tin thời gian
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Ngày tạo:</span>
                  <span className="ml-2 text-white">
                    {new Date(eventDetail.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {eventDetail.updatedAt && (
                  <div>
                    <span className="text-white/60">Ngày cập nhật:</span>
                    <span className="ml-2 text-white">
                      {new Date(eventDetail.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            Không thể tải thông tin event
          </div>
        )}
      </div>
    </Modal>
  );
}
