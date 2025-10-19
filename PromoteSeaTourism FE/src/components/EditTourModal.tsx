import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { tourService } from "../services/tourService";
import { categoryService } from "../services/categoryService";
import type {
  Tour,
  UpdateTourRequest,
  CreateTourImage,
  TourDetail,
} from "../types/tour";
import type { Category } from "../types/category";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface EditTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  tour: Tour | null;
  categories?: Category[];
}

export default function EditTourModal({
  isOpen,
  onClose,
  onSuccess,
  tour,
  categories: propCategories,
}: EditTourModalProps) {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tourDetail, setTourDetail] = useState<TourDetail | null>(null);
  const [newImage, setNewImage] = useState<CreateTourImage>({
    url: "",
    altText: "",
    caption: "",
    position: 0,
    isCover: false,
  });
  const [newImages, setNewImages] = useState<CreateTourImage[]>([]);

  const [formData, setFormData] = useState<UpdateTourRequest>({
    name: "",
    slug: "",
    summary: "",
    description: "",
    priceFrom: 0,
    itinerary: "",
    categoryId: 0,
    isPublished: true,
    addImages: [],
    attachMediaIds: [],
    removeLinkIds: [],
    reorders: [],
    coverImageId: 0,
  });

  const loadTourDetail = useCallback(async () => {
    if (!tour) return;

    setDetailLoading(true);
    try {
      const detail = await tourService.getTourById(tour.id);
      setTourDetail(detail);
      setFormData({
        name: detail.name,
        slug: detail.slug,
        summary: detail.summary,
        description: detail.description,
        priceFrom: detail.priceFrom,
        itinerary: detail.itinerary,
        categoryId: detail.categoryId,
        isPublished: detail.isPublished || true,
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        reorders: [],
        coverImageId: 0,
      });
    } catch (error) {
      console.error("Error loading tour detail:", error);
      toast.error("Không thể tải chi tiết tour!");
    } finally {
      setDetailLoading(false);
    }
  }, [tour]);

  const loadCategories = useCallback(async () => {
    if (propCategories) {
      setCategories(propCategories);
      return;
    }

    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, [propCategories]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "priceFrom" ? Number(value) : value,
    }));
  };

  const setCoverExistingImage = (imageId: number) => {
    setFormData((prev) => ({
      ...prev,
      coverImageId: imageId,
      addImages:
        prev.addImages?.map((img) => ({
          ...img,
          isCover: false,
        })) || [],
    }));
  };

  const removeExistingImage = (imageId: number) => {
    setFormData((prev) => ({
      ...prev,
      removeLinkIds: [...(prev.removeLinkIds || []), imageId],
    }));
  };

  const addImage = () => {
    if (newImage.url.trim()) {
      const imageToAdd = {
        ...newImage,
        position: newImages.length,
      };
      setNewImages((prev) => [...prev, imageToAdd]);
      setNewImage({
        url: "",
        altText: "",
        caption: "",
        position: 0,
        isCover: false,
      });
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setCoverNewImage = (index: number) => {
    setNewImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
    // Reset coverImageId to 0 since we're using a new image
    setFormData((prev) => ({
      ...prev,
      coverImageId: 0,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên tour!");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Vui lòng nhập slug!");
      return;
    }

    if (!formData.summary.trim()) {
      toast.error("Vui lòng nhập tóm tắt!");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả!");
      return;
    }

    if (formData.priceFrom <= 0) {
      toast.error("Vui lòng nhập giá từ hợp lệ!");
      return;
    }

    if (!formData.itinerary.trim()) {
      toast.error("Vui lòng nhập lịch trình!");
      return;
    }

    if (formData.categoryId === 0) {
      toast.error("Vui lòng chọn category!");
      return;
    }

    if (!tour) return;

    setLoading(true);
    try {
      const updateData: UpdateTourRequest = {
        ...formData,
        addImages: newImages.filter((img) => img.url.trim() !== ""),
      };

      await tourService.updateTour(tour.id, updateData);
      toast.success("Cập nhật tour thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating tour:", error);
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      slug: "",
      summary: "",
      description: "",
      priceFrom: 0,
      itinerary: "",
      categoryId: 0,
      isPublished: true,
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
    onClose();
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && tour) {
      loadTourDetail();
      loadCategories();
    } else {
      setFormData({
        name: "",
        slug: "",
        summary: "",
        description: "",
        priceFrom: 0,
        itinerary: "",
        categoryId: 0,
        isPublished: true,
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
    }
  }, [isOpen, tour, loadTourDetail, loadCategories]);

  if (!isOpen || !tour) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh Sửa Tour"
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
                  Tên Tour *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Nhập tên tour"
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
                  placeholder="tour-slug"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category *
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  required
                >
                  <option value={0}>Chọn category</option>
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
                  Giá Từ (VNĐ) *
                </label>
                <input
                  type="number"
                  name="priceFrom"
                  value={formData.priceFrom}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Tóm Tắt *
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Nhập tóm tắt tour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Mô Tả Chi Tiết *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Nhập mô tả chi tiết tour"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Lịch Trình *
              </label>
              <textarea
                name="itinerary"
                value={formData.itinerary}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Nhập lịch trình tour"
                required
              />
            </div>

            {/* Published Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="h-4 w-4 text-white/60 focus:ring-white/50 border-white/20 rounded bg-white/10"
                />
                <span className="text-white">Xuất bản tour</span>
              </label>
            </div>

            {/* Image Management */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Quản Lý Hình Ảnh
              </h3>

              {/* Current Images */}
              {tourDetail &&
                tourDetail.images &&
                tourDetail.images.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-white/80 mb-2">
                      Hình ảnh hiện tại:
                    </p>
                    <div className="space-y-2">
                      {tourDetail.images
                        .filter(
                          (image) =>
                            !formData.removeLinkIds?.includes(image.linkId)
                        )
                        .map((image) => {
                          return (
                            <div
                              key={image.linkId}
                              className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={image.url}
                                  alt={image.altText || ""}
                                  className="w-8 h-8 object-cover rounded"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                                  }}
                                />
                                <div className="text-white text-sm">
                                  <div className="font-medium">
                                    {image.caption || "No caption"}
                                  </div>
                                  <div className="text-white/60">
                                    {image.altText || "No alt text"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {image.isCover && (
                                  <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                                    Bìa
                                  </span>
                                )}
                                {formData.coverImageId === image.mediaId && (
                                  <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                    Sẽ là bìa
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                {formData.coverImageId !== image.mediaId && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setCoverExistingImage(image.mediaId)
                                    }
                                    className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                                  >
                                    Đặt bìa
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeExistingImage(image.linkId)
                                  }
                                  className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

              {/* Add New Images */}
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
                      setNewImage((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors text-white placeholder-white/60"
                    placeholder="URL hình ảnh"
                  />
                  <input
                    type="text"
                    value={newImage.altText}
                    onChange={(e) =>
                      setNewImage((prev) => ({
                        ...prev,
                        altText: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors text-white placeholder-white/60"
                    placeholder="Alt text"
                  />
                  <input
                    type="text"
                    value={newImage.caption}
                    onChange={(e) =>
                      setNewImage((prev) => ({
                        ...prev,
                        caption: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors text-white placeholder-white/60"
                    placeholder="Caption"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newImage.isCover}
                      onChange={(e) =>
                        setNewImage((prev) => ({
                          ...prev,
                          isCover: e.target.checked,
                        }))
                      }
                      className="h-4 w-4 text-white/60 focus:ring-white/50 border-white/20 rounded bg-white/10"
                    />
                    <span className="text-sm text-white">Đặt làm ảnh bìa</span>
                    <button
                      type="button"
                      onClick={addImage}
                      className="ml-auto px-3 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded text-sm hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-200"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

                {/* New Images Preview List */}
                {newImages.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-white mb-3">
                      Hình Ảnh Mới Đã Thêm
                    </h4>
                    <div className="space-y-3">
                      {newImages.map((image, index) => (
                        <div
                          key={index}
                          className="border border-white/20 rounded-lg p-4 bg-white/5"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={image.url}
                                alt={image.altText}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                {image.isCover && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                                    Sẽ là bìa
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-white/80 truncate">
                                <strong>URL:</strong> {image.url}
                              </p>
                              {image.altText && (
                                <p className="text-sm text-white/80 truncate">
                                  <strong>Alt:</strong> {image.altText}
                                </p>
                              )}
                              {image.caption && (
                                <p className="text-sm text-white/80 truncate">
                                  <strong>Caption:</strong> {image.caption}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setCoverNewImage(index)}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                Đặt bìa
                              </button>
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex justify-end gap-3 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 focus:outline-none focus:ring-2 focus:ring-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Tour"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
