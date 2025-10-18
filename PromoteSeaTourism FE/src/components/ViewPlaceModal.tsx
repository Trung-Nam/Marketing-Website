import { useState, useEffect } from "react";
import { placeService } from "../services/placeService";
import type { Place, PlaceDetail } from "../types/place";
import LoadingSpinner from "./LoadingSpinner";
import Modal from "./Modal";

interface ViewPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

export default function ViewPlaceModal({
  isOpen,
  onClose,
  place,
}: ViewPlaceModalProps) {
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && place) {
      loadPlaceDetail();
    }
  }, [isOpen, place]);

  const loadPlaceDetail = async () => {
    if (!place) return;

    setLoading(true);
    try {
      const response = await placeService.getPlaceById(place.id);
      setPlaceDetail(response.data);
    } catch (error) {
      console.error("Error loading place detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    // This would need to be passed as prop or loaded from context
    return `Category ${categoryId}`;
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem Chi Tiết Place"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : placeDetail ? (
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
                      {placeDetail.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tên:</span>
                    <p className="ml-2 text-white font-medium">
                      {placeDetail.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Slug:</span>
                    <span className="ml-2 text-white font-mono text-xs">
                      {placeDetail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Category:</span>
                    <span className="ml-2 text-white font-medium">
                      {getCategoryName(placeDetail.categoryId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Trạng thái:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        placeDetail.isPublished
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {placeDetail.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thông tin địa lý
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Địa chỉ:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.address}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tỉnh/TP:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.province || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Quận/Huyện:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.district || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Phường/Xã:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.ward || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tọa độ:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.geolat && placeDetail.geolng
                        ? `${placeDetail.geolat}, ${placeDetail.geolng}`
                        : "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Travel Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thông tin du lịch
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Mùa đẹp nhất:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.bestSeason}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Giờ mở cửa:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.openingHours || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Thông tin vé:</span>
                    <span className="ml-2 text-white">
                      {placeDetail.ticketInfo || "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {placeDetail.summary && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Tóm tắt
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {placeDetail.summary}
                </p>
              </div>
            )}

            {/* Content */}
            {placeDetail.content && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Nội dung
                </h3>
                <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {placeDetail.content}
                </div>
              </div>
            )}

            {/* Thumbnail */}
            {placeDetail.thumbnailUrl && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thumbnail
                </h3>
                <div className="flex justify-center">
                  <img
                    src={placeDetail.thumbnailUrl}
                    alt="Thumbnail"
                    loading="lazy"
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
                    {new Date(placeDetail.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                {placeDetail.updatedAt && (
                  <div>
                    <span className="text-white/60">Ngày cập nhật:</span>
                    <span className="ml-2 text-white">
                      {new Date(placeDetail.updatedAt).toLocaleString("vi-VN")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-white/60">
            Không thể tải thông tin place
          </div>
        )}
      </div>
    </Modal>
  );
}
