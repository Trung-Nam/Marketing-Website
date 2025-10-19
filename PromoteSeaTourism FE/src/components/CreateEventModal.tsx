import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { eventService } from "../services/eventService";
import { categoryService } from "../services/categoryService";
import { placeService } from "../services/placeService";
import type { CreateEventRequest, EventImageRequest } from "../types/event";
import type { Category } from "../types/category";
import type { Place } from "../types/place";
import Modal from "./Modal";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [formData, setFormData] = useState<CreateEventRequest>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    startTime: "",
    endTime: "",
    address: "",
    priceInfo: "",
    categoryId: 0,
    placeId: 0,
    isPublished: false,
    images: [],
  });

  const [newImage, setNewImage] = useState<EventImageRequest>({
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error("Thời gian bắt đầu phải trước thời gian kết thúc!");
      return;
    }

    setLoading(true);
    try {
      await eventService.createEvent(formData);
      toast.success("Tạo event thành công!");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error("Error creating event:", error);
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form when closing
      setFormData({
        title: "",
        slug: "",
        summary: "",
        content: "",
        startTime: "",
        endTime: "",
        address: "",
        priceInfo: "",
        categoryId: 0,
        placeId: 0,
        isPublished: false,
        images: [],
      });
      setNewImage({
        url: "",
        altText: "",
        caption: "",
        position: 0,
        isCover: false,
      });
    }
  };

  const addImage = () => {
    if (newImage.url.trim()) {
      const imageToAdd = {
        ...newImage,
        position: formData.images.length,
      };

      // If new image is set as cover, reset all existing images to not be cover
      const updatedImages = newImage.isCover
        ? formData.images.map((img) => ({ ...img, isCover: false }))
        : formData.images;

      setFormData({
        ...formData,
        images: [...updatedImages, imageToAdd],
      });
      setNewImage({
        url: "",
        altText: "",
        caption: "",
        position: 0,
        isCover: false,
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const setCoverImage = useCallback((index: number) => {
    setFormData((prev) => {
      const updatedImages = prev.images.map((img, i) => ({
        ...img,
        isCover: i === index,
      }));

      return {
        ...prev,
        images: updatedImages,
      };
    });
  }, []);

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        await Promise.all([loadCategories(), loadPlaces()]);
      };
      loadData();
    }
  }, [isOpen, loadCategories, loadPlaces]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo Event" size="xl">
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4 pr-2">
          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Tiêu đề *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
              placeholder="Nhập tiêu đề event"
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
              placeholder="event-slug"
            />
          </div>

          {/* Two column layout for some fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    categoryId: parseInt(e.target.value) || 0,
                  })
                }
                disabled={loading || categoriesLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                <option value={0} className="bg-gray-800 text-white">
                  {categoriesLoading ? "Đang tải..." : "Không chọn category"}
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
                Place
              </label>
              <select
                value={formData.placeId}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placeId: parseInt(e.target.value) || 0,
                  })
                }
                disabled={loading || placesLoading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                <option value={0} className="bg-gray-800 text-white">
                  {placesLoading ? "Đang tải..." : "Không chọn place"}
                </option>
                {places.map((place) => (
                  <option
                    key={place.id}
                    value={place.id}
                    className="bg-gray-800 text-white"
                  >
                    {place.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Two column layout for datetime */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Thời gian bắt đầu *
              </label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Thời gian kết thúc *
              </label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Địa chỉ
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
              placeholder="Nhập địa chỉ event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Thông tin giá
            </label>
            <input
              type="text"
              value={formData.priceInfo}
              onChange={(e) =>
                setFormData({ ...formData, priceInfo: e.target.value })
              }
              disabled={loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
              placeholder="Ví dụ: Miễn phí, 100.000 VNĐ, Từ 50.000 VNĐ"
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
              placeholder="Nhập tóm tắt event"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-1">
              Nội dung
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              disabled={loading}
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60 resize-none"
              placeholder="Nhập nội dung chi tiết event"
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

          {/* Images Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Hình ảnh
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
                  onClick={addImage}
                  className="px-3 py-1 bg-white/20 text-white rounded text-sm hover:bg-white/30 transition-colors"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Images List */}
            {formData.images.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-white/80">Hình ảnh sẽ được thêm:</p>
                {formData.images.map((img, index) => (
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
                          onClick={() => setCoverImage(index)}
                          className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                        >
                          Đặt bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              {loading ? "Đang tạo..." : "Tạo Event"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
