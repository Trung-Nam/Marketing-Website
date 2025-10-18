import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { tourService } from "../services/tourService";
import { categoryService } from "../services/categoryService";
import type { CreateTourRequest, CreateTourImage } from "../types/tour";
import type { Category } from "../types/category";
import Modal from "./Modal";

interface CreateTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTourModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTourModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newImage, setNewImage] = useState<CreateTourImage>({
    url: "",
    altText: "",
    caption: "",
    position: 0,
    isCover: false,
  });
  const [images, setImages] = useState<CreateTourImage[]>([]);

  const [formData, setFormData] = useState<CreateTourRequest>({
    name: "",
    slug: "",
    summary: "",
    description: "",
    priceFrom: 0,
    itinerary: "",
    categoryId: 0,
    isPublished: true,
    images: [],
    attachMediaIds: [],
    coverImageId: 0,
  });

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

  const addImage = () => {
    if (newImage.url.trim()) {
      const imageToAdd = {
        ...newImage,
        position: images.length,
      };
      setImages((prev) => [...prev, imageToAdd]);
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
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setCoverImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isCover: i === index,
      }))
    );
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

    setLoading(true);
    try {
      const createData: CreateTourRequest = {
        ...formData,
        images: images,
      };

      await tourService.createTour(createData);
      toast.success("Tạo tour thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error creating tour:", error);
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
      images: [],
      attachMediaIds: [],
      coverImageId: 0,
    });
    setImages([]);
    setNewImage({
      url: "",
      altText: "",
      caption: "",
      position: 0,
      isCover: false,
    });
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    } else {
      setCategories([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tạo Tour Mới" size="xl">
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

            {/* Add Image Form */}
            <div className="border border-white/20 rounded-lg p-4 mb-4 bg-white/5">
              <h4 className="text-md font-medium text-white mb-3">
                Thêm Hình Ảnh
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    URL Hình Ảnh
                  </label>
                  <input
                    type="url"
                    value={newImage.url}
                    onChange={(e) =>
                      setNewImage((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors text-white placeholder-white/60"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-1">
                    Alt Text
                  </label>
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
                    placeholder="Mô tả hình ảnh"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-white mb-1">
                  Caption
                </label>
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
                  placeholder="Chú thích hình ảnh"
                />
              </div>
              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id="isCover"
                  checked={newImage.isCover}
                  onChange={(e) =>
                    setNewImage((prev) => ({
                      ...prev,
                      isCover: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 text-white/60 focus:ring-white/50 border-white/20 rounded bg-white/10"
                />
                <label htmlFor="isCover" className="ml-2 text-sm text-white">
                  Đặt làm ảnh bìa
                </label>
              </div>
              <button
                type="button"
                onClick={addImage}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Thêm Hình Ảnh
              </button>
            </div>

            {/* Image Preview List */}
            {images.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-white mb-3">
                  Hình Ảnh Đã Thêm
                </h4>
                <div className="space-y-3">
                  {images.map((image, index) => (
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
                                Bìa
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
                            onClick={() => setCoverImage(index)}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Đặt bìa
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
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
              {loading ? "Đang tạo..." : "Tạo Tour"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
