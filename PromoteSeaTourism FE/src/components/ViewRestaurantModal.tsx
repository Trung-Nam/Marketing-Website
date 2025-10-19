import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { restaurantService } from "../services/restaurantService";
import { categoryService } from "../services/categoryService";
import type { Restaurant, RestaurantDetail } from "../types/restaurant";
import type { Category } from "../types/category";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";
import { getRestaurantCoverImageInfo } from "../utils/restaurantUtils";

interface ViewRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
}

export default function ViewRestaurantModal({
  isOpen,
  onClose,
  restaurant,
}: ViewRestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [restaurantDetail, setRestaurantDetail] =
    useState<RestaurantDetail | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const loadRestaurantDetail = useCallback(async () => {
    if (!restaurant) return;

    setLoading(true);
    try {
      const detail = await restaurantService.getRestaurantById(restaurant.id);
      console.log("Restaurant detail loaded:", detail);
      console.log("Category from restaurant:", detail.category);
      setRestaurantDetail(detail);
    } catch (error) {
      console.error("Error loading restaurant detail:", error);
      toast.error("Không thể tải chi tiết restaurant!");
    } finally {
      setLoading(false);
    }
  }, [restaurant]);

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

  const getCategoryName = (category: any, categoryId?: number) => {
    if (category && category.name) {
      console.log("Category object:", category);
      return category.name;
    }

    if (categoryId && categories.length > 0) {
      const foundCategory = categories.find((cat) => cat.id === categoryId);
      if (foundCategory) {
        console.log("Found category by ID:", foundCategory);
        return foundCategory.name;
      }
    }

    console.log(
      "Category is null/undefined:",
      category,
      "categoryId:",
      categoryId
    );
    return "Không có";
  };

  // Load restaurant detail and categories when modal opens
  useEffect(() => {
    if (isOpen && restaurant) {
      loadRestaurantDetail();
      loadCategories();
    }
  }, [isOpen, restaurant, loadRestaurantDetail, loadCategories]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRestaurantDetail(null);
      setCategories([]);
    }
  }, [isOpen]);

  if (!isOpen || !restaurant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem Chi Tiết Restaurant"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : restaurantDetail ? (
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
                      {restaurantDetail.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tên:</span>
                    <p className="ml-2 text-white font-medium">
                      {restaurantDetail.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Slug:</span>
                    <span className="ml-2 text-white font-mono text-xs">
                      {restaurantDetail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Category:</span>
                    <span className="ml-2 text-white font-medium">
                      {getCategoryName(
                        restaurantDetail.category,
                        restaurantDetail.categoryId
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Trạng thái:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        restaurantDetail.isPublished
                          ? "bg-green-500/20 text-green-300"
                          : "bg-red-500/20 text-red-300"
                      }`}
                    >
                      {restaurantDetail.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thông tin liên hệ
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Địa chỉ:</span>
                    <span className="ml-2 text-white">
                      {restaurantDetail.address || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Điện thoại:</span>
                    <span className="ml-2 text-white">
                      {restaurantDetail.phone || "Không có"}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Website:</span>
                    <span className="ml-2 text-white">
                      {restaurantDetail.website ? (
                        <a
                          href={restaurantDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 underline"
                        >
                          {restaurantDetail.website}
                        </a>
                      ) : (
                        "Không có"
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Khoảng giá:</span>
                    <span className="ml-2 text-white">
                      {restaurantDetail.priceRangeText || "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary */}
            {restaurantDetail.summary && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Tóm tắt
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {restaurantDetail.summary}
                </p>
              </div>
            )}

            {/* Content */}
            {restaurantDetail.content && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Nội dung
                </h3>
                <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                  {restaurantDetail.content}
                </div>
              </div>
            )}

            {/* Cover Image */}
            {(() => {
              const coverInfo = getRestaurantCoverImageInfo(restaurantDetail);
              return coverInfo.url ? (
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Ảnh bìa chính
                  </h3>
                  <div className="relative">
                    <img
                      src={coverInfo.url}
                      alt={coverInfo.alt}
                      loading="lazy"
                      className="w-full h-64 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                      }}
                    />
                    {coverInfo.caption && (
                      <p className="text-white/80 text-sm mt-2">
                        {coverInfo.caption}
                      </p>
                    )}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Images */}
            {restaurantDetail.images && restaurantDetail.images.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Hình ảnh khác
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {restaurantDetail.images.map((image, index) => (
                    <div key={image.linkId} className="relative">
                      <img
                        src={image.url}
                        alt={image.altText || `Restaurant image ${index + 1}`}
                        loading="lazy"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                        }}
                      />
                      {image.isCover && (
                        <div className="absolute top-2 right-2 bg-ocean-600 text-white text-xs px-2 py-1 rounded">
                          Ảnh bìa
                        </div>
                      )}
                      {image.caption && (
                        <p className="text-white/80 text-sm mt-2">
                          {image.caption}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <h3 className="text-lg font-semibold text-white mb-3">
                Thông tin thời gian
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Ngày tạo:</span>
                  <span className="ml-2 text-white">
                    {new Date(restaurantDetail.createdAt).toLocaleString(
                      "vi-VN"
                    )}
                  </span>
                </div>
                {restaurantDetail.updatedAt && (
                  <div>
                    <span className="text-white/60">Ngày cập nhật:</span>
                    <span className="ml-2 text-white">
                      {new Date(restaurantDetail.updatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-white/60">
              Không thể tải thông tin restaurant
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
