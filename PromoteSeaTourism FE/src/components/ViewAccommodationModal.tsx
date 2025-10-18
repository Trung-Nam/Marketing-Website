import { useState, useEffect, useCallback } from "react";
import { accommodationService } from "../services/accommodationService";
import { categoryService } from "../services/categoryService";
import type {
  Accommodation,
  AccommodationDetail,
} from "../types/accommodation";
import type { Category } from "../types/category";
import Modal from "./Modal";

interface ViewAccommodationModalProps {
  isOpen: boolean;
  onClose: () => void;
  accommodation: Accommodation | null;
}

export default function ViewAccommodationModal({
  isOpen,
  onClose,
  accommodation,
}: ViewAccommodationModalProps) {
  const [loading, setLoading] = useState(false);
  const [accommodationDetail, setAccommodationDetail] =
    useState<AccommodationDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadAccommodationDetail = useCallback(async () => {
    if (!accommodation) return;

    setLoading(true);
    try {
      const detail = await accommodationService.getAccommodationById(
        accommodation.id
      );
      setAccommodationDetail(detail);
    } catch (error) {
      console.error("Error loading accommodation detail:", error);
    } finally {
      setLoading(false);
    }
  }, [accommodation]);

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
    } finally {
      setCategoriesLoading(false);
    }
  }, []);

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `ID: ${categoryId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && accommodation) {
      loadAccommodationDetail();
      loadCategories();
    }
  }, [isOpen, accommodation, loadAccommodationDetail, loadCategories]);

  if (!isOpen || !accommodation) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi Tiết Accommodation"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : accommodationDetail ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID
                  </label>
                  <p className="text-gray-900">{accommodationDetail.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên
                  </label>
                  <p className="text-gray-900 font-medium">
                    {accommodationDetail.name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <p className="text-gray-900 font-mono">
                    {accommodationDetail.slug}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa chỉ
                  </label>
                  <p className="text-gray-900">{accommodationDetail.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Điện thoại
                  </label>
                  <p className="text-gray-900">
                    {accommodationDetail.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <p className="text-gray-900">
                    {accommodationDetail.website ? (
                      <a
                        href={accommodationDetail.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {accommodationDetail.website}
                      </a>
                    ) : (
                      "N/A"
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <p className="text-gray-900">
                    {getCategoryName(accommodationDetail.categoryId)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đánh giá
                  </label>
                  <p className="text-gray-900">
                    {accommodationDetail.star
                      ? `⭐ ${accommodationDetail.star}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá
                  </label>
                  <p className="text-gray-900 font-medium">
                    {accommodationDetail.minPrice.toLocaleString()} -{" "}
                    {accommodationDetail.maxPrice.toLocaleString()} VNĐ
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      accommodationDetail.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {accommodationDetail.isPublished ? "Published" : "Draft"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày tạo
                  </label>
                  <p className="text-gray-900">
                    {formatDate(accommodationDetail.createdAt)}
                  </p>
                </div>
                {accommodationDetail.updatedAt && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày cập nhật
                    </label>
                    <p className="text-gray-900">
                      {formatDate(accommodationDetail.updatedAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tóm tắt
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {accommodationDetail.summary}
              </p>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {accommodationDetail.content}
              </p>
            </div>

            {/* Images */}
            {accommodationDetail.images &&
              accommodationDetail.images.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Hình ảnh ({accommodationDetail.images.length})
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {accommodationDetail.images
                      .sort((a, b) => a.position - b.position)
                      .map((image) => (
                        <div key={image.linkId} className="relative">
                          <img
                            src={image.url}
                            alt={image.altText || ""}
                            className="w-full h-48 object-cover rounded-lg border border-gray-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                            }}
                          />
                          <div className="absolute top-2 left-2">
                            {image.isCover && (
                              <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                                Bìa
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 rounded-b-lg">
                            <p className="text-sm font-medium truncate">
                              {image.caption || "No caption"}
                            </p>
                            <p className="text-xs opacity-80">
                              {image.altText || "No alt text"}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Không thể tải thông tin accommodation
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
