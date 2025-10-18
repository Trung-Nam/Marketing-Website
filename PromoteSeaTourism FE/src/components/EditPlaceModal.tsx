import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { placeService } from "../services/placeService";
import { categoryService } from "../services/categoryService";
import { imageService } from "../services/imageService";
import type { Place, UpdatePlaceRequest, PlaceDetail } from "../types/place";
import type { Category } from "../types/category";
import type { Image } from "../types/image";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface EditPlaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  place: Place | null;
}

export default function EditPlaceModal({
  isOpen,
  onClose,
  onSuccess,
  place,
}: EditPlaceModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingPlace, setLoadingPlace] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [images, setImages] = useState<Image[]>([]);
  const [imagesLoading, setImagesLoading] = useState(false);
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [formData, setFormData] = useState<UpdatePlaceRequest>({
    name: "",
    slug: "",
    summary: "",
    content: null,
    address: "",
    province: null,
    district: null,
    ward: null,
    geolat: null,
    geolng: null,
    bestSeason: "",
    ticketInfo: null,
    openingHours: null,
    categoryId: 0,
    coverImageId: null,
    isPublished: false,
  });

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

  const loadImages = useCallback(async () => {
    setImagesLoading(true);
    try {
      const response = await imageService.getImages({
        page: 1,
        pageSize: 100,
      });
      setImages(response.data);
    } catch (error) {
      console.error("Error loading images:", error);
      toast.error("Không thể tải danh sách images!");
    } finally {
      setImagesLoading(false);
    }
  }, []);

  const loadPlaceDetail = useCallback(async () => {
    if (!place) return;

    setLoadingPlace(true);
    try {
      const response = await placeService.getPlaceById(place.id);
      setPlaceDetail(response.data);

      // Populate form with existing data
      setFormData({
        name: response.data.name,
        slug: response.data.slug,
        summary: response.data.summary,
        content: response.data.content,
        address: response.data.address,
        province: response.data.province,
        district: response.data.district,
        ward: response.data.ward,
        geolat: response.data.geolat,
        geolng: response.data.geolng,
        bestSeason: response.data.bestSeason,
        ticketInfo: response.data.ticketInfo,
        openingHours: response.data.openingHours,
        categoryId: response.data.categoryId,
        coverImageId: response.data.coverImageId,
        isPublished: response.data.isPublished,
      });
    } catch (error) {
      console.error("Error loading place detail:", error);
      toast.error("Không thể tải thông tin place!");
    } finally {
      setLoadingPlace(false);
    }
  }, [place]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!place) return;

    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ!");
      return;
    }

    if (!formData.bestSeason.trim()) {
      toast.error("Vui lòng nhập mùa đẹp nhất!");
      return;
    }

    setLoading(true);
    try {
      // Clean up data before sending
      const cleanedData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        summary: formData.summary.trim(),
        content: formData.content?.trim() || null,
        address: formData.address.trim(),
        province: formData.province?.trim() || null,
        district: formData.district?.trim() || null,
        ward: formData.ward?.trim() || null,
        geolat: formData.geolat || null,
        geolng: formData.geolng || null,
        bestSeason: formData.bestSeason.trim(),
        ticketInfo: formData.ticketInfo?.trim() || null,
        openingHours: formData.openingHours?.trim() || null,
        categoryId: formData.categoryId,
        coverImageId: formData.coverImageId || null,
        isPublished: formData.isPublished,
      };

      console.log("Updating place with data:", cleanedData);
      console.log("Place ID:", place.id);
      await placeService.updatePlace(place.id, cleanedData);
      toast.success("Cập nhật place thành công!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Error updating place:", error);
      console.error("Request data:", formData);
      if (error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status:", error.response.status);
      }
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !loadingPlace) {
      onClose();
      // Reset form when closing
      setFormData({
        name: "",
        slug: "",
        summary: "",
        content: null,
        address: "",
        province: null,
        district: null,
        ward: null,
        geolat: null,
        geolng: null,
        bestSeason: "",
        ticketInfo: null,
        openingHours: null,
        categoryId: 0,
        coverImageId: null,
        isPublished: false,
      });
      setPlaceDetail(null);
    }
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadImages();
      loadPlaceDetail();
    }
  }, [isOpen, loadCategories, loadImages, loadPlaceDetail]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh Sửa Place"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loadingPlace ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pr-2">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Tên place *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Nhập tên place"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="place-slug"
              />
            </div>

            {/* Two column layout for address info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Mùa đẹp nhất *
                </label>
                <input
                  type="text"
                  value={formData.bestSeason}
                  onChange={(e) =>
                    setFormData({ ...formData, bestSeason: e.target.value })
                  }
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Ví dụ: 3-8, 12-2"
                />
              </div>
            </div>

            {/* Location details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Tỉnh/TP
                </label>
                <input
                  type="text"
                  value={formData.province || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      province: e.target.value || null,
                    })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Tỉnh/TP"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Quận/Huyện
                </label>
                <input
                  type="text"
                  value={formData.district || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      district: e.target.value || null,
                    })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Quận/Huyện"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Phường/Xã
                </label>
                <input
                  type="text"
                  value={formData.ward || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ward: e.target.value || null,
                    })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Phường/Xã"
                />
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Vĩ độ (Latitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.geolat || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      geolat: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Ví dụ: 10.8231"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Kinh độ (Longitude)
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.geolng || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      geolng: e.target.value
                        ? parseFloat(e.target.value)
                        : null,
                    })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Ví dụ: 106.6297"
                />
              </div>
            </div>

            {/* Category and Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                  disabled={loading || categoriesLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <option value={0} className="bg-gray-800 text-white">
                    {categoriesLoading ? "Đang tải..." : "Chọn category"}
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-gray-800 text-white"
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Cover Image
                </label>
                <select
                  value={formData.coverImageId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coverImageId: e.target.value
                        ? parseInt(e.target.value)
                        : null,
                    })
                  }
                  disabled={loading || imagesLoading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                >
                  <option value="" className="bg-gray-800 text-white">
                    {imagesLoading ? "Đang tải..." : "Không chọn ảnh bìa"}
                  </option>
                  {images.map((image) => (
                    <option
                      key={image.id}
                      value={image.id}
                      className="bg-gray-800 text-white"
                    >
                      ID: {image.id} -{" "}
                      {image.caption || image.altText || "No caption"}
                    </option>
                  ))}
                </select>
                {formData.coverImageId && (
                  <div className="mt-2">
                    {(() => {
                      const selectedImage = images.find(
                        (img) => img.id === formData.coverImageId
                      );
                      return selectedImage ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={selectedImage.url}
                            alt={selectedImage.altText || ""}
                            loading="lazy"
                            className="w-12 h-12 object-cover rounded border border-white/20"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                            }}
                          />
                          <div className="text-white/80 text-sm">
                            <div className="font-medium">
                              {selectedImage.caption ||
                                selectedImage.altText ||
                                "No caption"}
                            </div>
                            <div className="text-white/60">
                              ID: {selectedImage.id}
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Giờ mở cửa
              </label>
              <select
                value={formData.openingHours || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    openingHours: e.target.value || null,
                  })
                }
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                <option value="" className="bg-gray-800 text-white">
                  Chọn giờ mở cửa
                </option>
                <option value="24/7" className="bg-gray-800 text-white">
                  24/7 (Mở cả ngày)
                </option>
                <option value="6:00 - 18:00" className="bg-gray-800 text-white">
                  6:00 - 18:00 (Sáng sớm - Chiều tối)
                </option>
                <option value="7:00 - 19:00" className="bg-gray-800 text-white">
                  7:00 - 19:00
                </option>
                <option value="8:00 - 17:00" className="bg-gray-800 text-white">
                  8:00 - 17:00 (Giờ hành chính)
                </option>
                <option value="8:00 - 20:00" className="bg-gray-800 text-white">
                  8:00 - 20:00
                </option>
                <option value="9:00 - 17:00" className="bg-gray-800 text-white">
                  9:00 - 17:00
                </option>
                <option value="9:00 - 18:00" className="bg-gray-800 text-white">
                  9:00 - 18:00
                </option>
                <option value="9:00 - 21:00" className="bg-gray-800 text-white">
                  9:00 - 21:00
                </option>
                <option
                  value="10:00 - 18:00"
                  className="bg-gray-800 text-white"
                >
                  10:00 - 18:00
                </option>
                <option
                  value="10:00 - 20:00"
                  className="bg-gray-800 text-white"
                >
                  10:00 - 20:00
                </option>
                <option
                  value="10:00 - 22:00"
                  className="bg-gray-800 text-white"
                >
                  10:00 - 22:00
                </option>
                <option
                  value="11:00 - 19:00"
                  className="bg-gray-800 text-white"
                >
                  11:00 - 19:00
                </option>
                <option
                  value="11:00 - 21:00"
                  className="bg-gray-800 text-white"
                >
                  11:00 - 21:00
                </option>
                <option
                  value="12:00 - 20:00"
                  className="bg-gray-800 text-white"
                >
                  12:00 - 20:00
                </option>
                <option
                  value="13:00 - 21:00"
                  className="bg-gray-800 text-white"
                >
                  13:00 - 21:00
                </option>
                <option
                  value="14:00 - 22:00"
                  className="bg-gray-800 text-white"
                >
                  14:00 - 22:00
                </option>
                <option
                  value="16:00 - 24:00"
                  className="bg-gray-800 text-white"
                >
                  16:00 - 24:00 (Chiều tối - Đêm)
                </option>
                <option
                  value="18:00 - 02:00"
                  className="bg-gray-800 text-white"
                >
                  18:00 - 02:00 (Tối - Đêm)
                </option>
                <option
                  value="20:00 - 04:00"
                  className="bg-gray-800 text-white"
                >
                  20:00 - 04:00 (Đêm - Sáng)
                </option>
                <option value="Tùy theo mùa" className="bg-gray-800 text-white">
                  Tùy theo mùa
                </option>
                <option
                  value="Theo lịch trình"
                  className="bg-gray-800 text-white"
                >
                  Theo lịch trình
                </option>
                <option
                  value="Không cố định"
                  className="bg-gray-800 text-white"
                >
                  Không cố định
                </option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Thông tin vé
              </label>
              <input
                type="text"
                value={formData.ticketInfo || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ticketInfo: e.target.value || null,
                  })
                }
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Ví dụ: Miễn phí, 50.000 VNĐ/người"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Tóm tắt
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) =>
                  setFormData({ ...formData, summary: e.target.value })
                }
                disabled={loading}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60 resize-none"
                placeholder="Nhập tóm tắt về place"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Nội dung
              </label>
              <textarea
                value={formData.content || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    content: e.target.value || null,
                  })
                }
                disabled={loading}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60 resize-none"
                placeholder="Nhập nội dung chi tiết về place"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-3">
                Trạng thái
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    isPublished: !formData.isPublished,
                  })
                }
                disabled={loading}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  formData.isPublished
                    ? "bg-gradient-to-r from-ocean-600 to-turquoise-600"
                    : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.isPublished ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="ml-3 text-sm text-white/80">
                {formData.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 justify-end">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 font-medium"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {loading ? "Đang cập nhật..." : "Cập nhật Place"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
