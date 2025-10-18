import { useState, useEffect } from "react";
import { tourService } from "../services/tourService";
import { categoryService } from "../services/categoryService";
import type { Tour, TourDetail } from "../types/tour";
import type { Category } from "../types/category";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface ViewTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  tour: Tour | null;
}

export default function ViewTourModal({
  isOpen,
  onClose,
  tour,
}: ViewTourModalProps) {
  const [tourDetail, setTourDetail] = useState<TourDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTourDetail = async () => {
    if (!tour) return;

    setLoading(true);
    try {
      const detail = await tourService.getTourById(tour.id);
      setTourDetail(detail);
    } catch (error) {
      console.error("Error loading tour detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const getCategoryName = (category: any, categoryId?: number) => {
    if (category?.name) {
      return category.name;
    }
    if (categoryId) {
      const foundCategory = categories.find((cat) => cat.id === categoryId);
      return foundCategory?.name || "Unknown Category";
    }
    return "Unknown Category";
  };

  useEffect(() => {
    if (isOpen && tour) {
      loadTourDetail();
      loadCategories();
    } else {
      setTourDetail(null);
      setCategories([]);
    }
  }, [isOpen, tour]);

  if (!isOpen || !tour) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Chi Tiết Tour" size="xl">
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : tourDetail ? (
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Thông Tin Cơ Bản
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Tên Tour
                  </label>
                  <p className="text-white font-medium">{tourDetail.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Slug
                  </label>
                  <p className="text-white/90 text-sm">{tourDetail.slug}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Category
                  </label>
                  <p className="text-white">
                    {getCategoryName(
                      tourDetail.category,
                      tourDetail.categoryId
                    )}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Giá Từ
                  </label>
                  <p className="text-white font-semibold text-lg">
                    {tourDetail.priceFrom.toLocaleString()} VNĐ
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Ngày Tạo
                  </label>
                  <p className="text-white/90 text-sm">
                    {new Date(tourDetail.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">
                Thông Tin Bổ Sung
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Trạng Thái
                  </label>
                  <p className="text-white">
                    {tourDetail.isPublished ? "Đã xuất bản" : "Chưa xuất bản"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-1">
                    Cập Nhật Lần Cuối
                  </label>
                  <p className="text-white/90 text-sm">
                    {tourDetail.updatedAt
                      ? new Date(tourDetail.updatedAt).toLocaleString()
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">Tóm Tắt</h3>
            <p className="text-white/90 leading-relaxed">
              {tourDetail.summary}
            </p>
          </div>

          {/* Description */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">
              Mô Tả Chi Tiết
            </h3>
            <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {tourDetail.description}
            </div>
          </div>

          {/* Itinerary */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3">
              Lịch Trình
            </h3>
            <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
              {tourDetail.itinerary}
            </div>
          </div>

          {/* Images */}
          <div className="bg-white/5 rounded-lg p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Hình Ảnh</h3>
            {tourDetail.images && tourDetail.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tourDetail.images.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.altText || tourDetail.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.isCover && (
                      <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Bìa
                      </div>
                    )}
                    {image.caption && (
                      <p className="mt-2 text-sm text-white/80">
                        {image.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-white/60">Chưa có hình ảnh nào</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-white/60">Không thể tải chi tiết tour</p>
        </div>
      )}
    </Modal>
  );
}
