import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { restaurantService } from "../services/restaurantService";
import { categoryService } from "../services/categoryService";
import type {
  Restaurant,
  RestaurantDetail,
  UpdateRestaurantRequest,
  UpdateRestaurantImage,
  ReorderRestaurantImage,
} from "../types/restaurant";
import type { Category } from "../types/category";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface EditRestaurantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  restaurant: Restaurant | null;
}

export default function EditRestaurantModal({
  isOpen,
  onClose,
  onSuccess,
  restaurant,
}: EditRestaurantModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [restaurantDetail, setRestaurantDetail] =
    useState<RestaurantDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [formData, setFormData] = useState<UpdateRestaurantRequest>({
    name: "",
    slug: "",
    summary: "",
    content: "",
    address: "",
    phone: "",
    website: "",
    priceRangeText: "",
    categoryId: 0,
    isPublished: true,
    createdAt: "",
    addImages: [],
    attachMediaIds: [],
    removeLinkIds: [],
    reorders: [],
    coverImageId: 0,
  });

  const [newImages, setNewImages] = useState<UpdateRestaurantImage[]>([]);
  const [newImage, setNewImage] = useState<UpdateRestaurantImage>({
    url: "",
    altText: "",
    caption: "",
    position: 0,
    isCover: false,
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

  const loadRestaurantDetail = useCallback(async () => {
    if (!restaurant) return;

    setDetailLoading(true);
    try {
      const detail = await restaurantService.getRestaurantById(restaurant.id);
      setRestaurantDetail(detail);

      // Populate form data
      setFormData({
        name: detail.name,
        slug: detail.slug,
        summary: detail.summary,
        content: detail.content,
        address: detail.address,
        phone: detail.phone || "",
        website: detail.website || "",
        priceRangeText: detail.priceRangeText,
        categoryId: detail.categoryId,
        isPublished: detail.isPublished,
        createdAt: detail.createdAt,
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        reorders: [],
        coverImageId: detail.coverImageId || 0,
      });
    } catch (error) {
      console.error("Error loading restaurant detail:", error);
      toast.error("Không thể tải chi tiết restaurant!");
    } finally {
      setDetailLoading(false);
    }
  }, [restaurant]);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && restaurant) {
      loadRestaurantDetail();
      loadCategories();
    }
  }, [isOpen, restaurant, loadRestaurantDetail, loadCategories]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        slug: "",
        summary: "",
        content: "",
        address: "",
        phone: "",
        website: "",
        priceRangeText: "",
        categoryId: 0,
        isPublished: true,
        createdAt: "",
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        reorders: [],
        coverImageId: 0,
      });
      setNewImages([]);
      setNewImage({
        url: "",
        altText: "",
        caption: "",
        position: 0,
        isCover: false,
      });
      setRestaurantDetail(null);
    }
  }, [isOpen]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addNewImage = () => {
    if (!newImage.url.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh!");
      return;
    }

    const imageToAdd: UpdateRestaurantImage = {
      ...newImage,
      position: newImages.length,
    };
    setNewImages([...newImages, imageToAdd]);
    setNewImage({
      url: "",
      altText: "",
      caption: "",
      position: 0,
      isCover: false,
    });
  };

  const removeNewImage = (index: number) => {
    const updatedImages = newImages.filter((_, i) => i !== index);
    const finalImages = updatedImages.map((img, i) => ({
      ...img,
      position: i,
      isCover: i === 0,
    }));
    setNewImages(finalImages);
  };

  const setNewCoverImage = (index: number) => {
    const updatedImages = newImages.map((img, i) => ({
      ...img,
      isCover: i === index,
    }));
    setNewImages(updatedImages);
  };

  const setCoverExistingImage = (mediaId: number) => {
    setFormData((prev) => ({
      ...prev,
      coverImageId: mediaId,
    }));
  };

  const removeExistingImage = (linkId: number) => {
    setFormData((prev) => ({
      ...prev,
      removeLinkIds: [...prev.removeLinkIds, linkId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên restaurant!");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Vui lòng nhập slug!");
      return;
    }

    if (formData.categoryId === 0) {
      toast.error("Vui lòng chọn category!");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ!");
      return;
    }

    if (!formData.priceRangeText.trim()) {
      toast.error("Vui lòng nhập khoảng giá!");
      return;
    }

    if (!restaurant) return;

    setLoading(true);
    try {
      const updateData: UpdateRestaurantRequest = {
        ...formData,
        addImages: newImages.filter((img) => img.url.trim() !== ""),
      };

      await restaurantService.updateRestaurant(restaurant.id, updateData);
      toast.success("Cập nhật restaurant thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating restaurant:", error);
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !restaurant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chỉnh Sửa Restaurant"
      size="xl"
    >
      {detailLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 pr-2">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Tên Restaurant *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Nhập tên restaurant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="restaurant-slug"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Tóm tắt
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Mô tả ngắn về restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Nội dung
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Mô tả chi tiết về restaurant"
              />
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Địa chỉ *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Địa chỉ restaurant"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Điện thoại
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Số điện thoại"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Khoảng giá *
                </label>
                <input
                  type="text"
                  name="priceRangeText"
                  value={formData.priceRangeText}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Ví dụ: 100k-500k"
                  required
                />
              </div>
            </div>

            {/* Category and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category *
                </label>
                {categoriesLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2 text-white">
                      Đang tải categories...
                    </span>
                  </div>
                ) : (
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    required
                  >
                    <option value={0} className="bg-gray-800 text-white">
                      Chọn category
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
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-white/60 focus:ring-white/50 border-white/20 rounded bg-white/10"
                />
                <label className="ml-2 block text-sm text-white">
                  Xuất bản ngay
                </label>
              </div>
            </div>

            {/* Current Images */}
            {restaurantDetail &&
              restaurantDetail.images &&
              restaurantDetail.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-white/80 mb-2">
                    Hình ảnh hiện tại:
                  </p>
                  <div className="space-y-2">
                    {restaurantDetail.images
                      .filter(
                        (img) => !formData.removeLinkIds.includes(img.linkId)
                      )
                      .map((img) => (
                        <div
                          key={img.linkId}
                          className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={img.url}
                              alt={img.altText || ""}
                              className="w-8 h-8 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                              }}
                            />
                            <div className="text-white text-sm">
                              <div className="font-medium">
                                {img.caption || "No caption"}
                              </div>
                              <div className="text-white/60">
                                {img.altText || "No alt text"}
                              </div>
                            </div>
                            {img.isCover && (
                              <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                                Bìa
                              </span>
                            )}
                            {formData.coverImageId === img.mediaId && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                Sẽ là bìa
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {formData.coverImageId !== img.mediaId && (
                              <button
                                type="button"
                                onClick={() =>
                                  setCoverExistingImage(img.mediaId)
                                }
                                className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                              >
                                Đặt bìa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(img.linkId)}
                              className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* New Images Section */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Thêm hình ảnh mới
              </label>

              {/* Add Image Form */}
              <div className="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <input
                  type="url"
                  value={newImage.url}
                  onChange={(e) =>
                    setNewImage({ ...newImage, url: e.target.value })
                  }
                  placeholder="URL hình ảnh"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60 text-sm"
                />
                <input
                  type="text"
                  value={newImage.altText}
                  onChange={(e) =>
                    setNewImage({ ...newImage, altText: e.target.value })
                  }
                  placeholder="Alt text"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60 text-sm"
                />
                <input
                  type="text"
                  value={newImage.caption}
                  onChange={(e) =>
                    setNewImage({ ...newImage, caption: e.target.value })
                  }
                  placeholder="Caption"
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/60 text-sm"
                />
                <div className="flex items-center gap-2">
                  <label className="flex items-center text-white text-sm">
                    <input
                      type="checkbox"
                      checked={newImage.isCover}
                      onChange={(e) =>
                        setNewImage({ ...newImage, isCover: e.target.checked })
                      }
                      className="mr-2"
                    />
                    Ảnh bìa
                  </label>
                  <button
                    type="button"
                    onClick={addNewImage}
                    className="px-3 py-1 bg-white/20 text-white rounded text-sm hover:bg-white/30 transition-colors"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {/* New Images List */}
              {newImages.length > 0 && (
                <div className="mt-2 space-y-2">
                  <p className="text-sm text-white/80">
                    Hình ảnh mới sẽ được thêm:
                  </p>
                  {newImages.map((img, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={img.url}
                          alt={img.altText || ""}
                          className="w-8 h-8 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                          }}
                        />
                        <div className="text-white text-sm">
                          <div className="font-medium">
                            {img.caption || "No caption"}
                          </div>
                          <div className="text-white/60">
                            {img.altText || "No alt text"}
                          </div>
                        </div>
                        {img.isCover && (
                          <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                            Bìa
                          </span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {!img.isCover && (
                          <button
                            type="button"
                            onClick={() => setNewCoverImage(index)}
                            className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                          >
                            Đặt bìa
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-white bg-white/20 rounded-lg hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Restaurant"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
