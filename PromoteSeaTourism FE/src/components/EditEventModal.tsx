import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { eventService } from "../services/eventService";
import { categoryService } from "../services/categoryService";
import { placeService } from "../services/placeService";
import type {
  Event,
  UpdateEventRequest,
  EventImageRequest,
  EventDetail,
} from "../types/event";
import type { Category } from "../types/category";
import type { Place } from "../types/place";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  event: Event | null;
}

export default function EditEventModal({
  isOpen,
  onClose,
  onSuccess,
  event,
}: EditEventModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [, setEventDetail] = useState<EventDetail | null>(null);
  const [formData, setFormData] = useState<UpdateEventRequest>({
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
    createdAt: "",
    addImages: [],
    attachMediaIds: [],
    removeLinkIds: [],
    reorders: [],
    coverImageId: 0,
  });

  const [newImage, setNewImage] = useState<EventImageRequest>({
    url: "",
    altText: "",
    caption: "",
    position: 0,
    isCover: false,
  });

  const [existingImages, setExistingImages] = useState<
    Array<{
      linkId: number;
      mediaId: number;
      url: string;
      altText: string;
      caption: string;
      position: number;
      isCover: boolean;
    }>
  >([]);

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

  const loadEventDetail = useCallback(async () => {
    if (!event) return;

    setLoadingEvent(true);
    try {
      const eventData = await eventService.getEventById(event.id);
      console.log("Event data loaded:", eventData);
      console.log("Category object:", eventData.category);
      console.log("Place object:", eventData.place);

      setEventDetail(eventData);
      setExistingImages(eventData.images || []);

      // Populate form with existing data
      const newFormData = {
        title: eventData.title || "",
        slug: eventData.slug || "",
        summary: eventData.summary || "",
        content: eventData.content || "",
        startTime: eventData.startTime
          ? new Date(eventData.startTime).toISOString().slice(0, 16)
          : "",
        endTime: eventData.endTime
          ? new Date(eventData.endTime).toISOString().slice(0, 16)
          : "",
        address: eventData.address || "",
        priceInfo: eventData.priceInfo || "",
        categoryId: eventData.category?.id || 0,
        placeId: eventData.place?.id || 0,
        isPublished: eventData.isPublished || false,
        createdAt: eventData.createdAt || "",
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        reorders: [],
        coverImageId:
          (eventData as EventDetail & { coverImageId?: number }).coverImageId ||
          0,
      };

      console.log("Setting form data:", newFormData);
      console.log("Category ID in form:", newFormData.categoryId);
      console.log("Place ID in form:", newFormData.placeId);
      setFormData(newFormData);
    } catch (error) {
      console.error("Error loading event detail:", error);
      toast.error("Không thể tải thông tin event!");
    } finally {
      setLoadingEvent(false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ!");
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      toast.error("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    setLoading(true);
    try {
      await eventService.updateEvent(event.id, formData);
      toast.success("Cập nhật event thành công!");
      onSuccess?.();
      handleClose();
    } catch (error: unknown) {
      console.error("Error updating event:", error);
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { data: unknown; status: number };
        };
        console.error("Server response:", axiosError.response.data);
        console.error("Status:", axiosError.response.status);
      }
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
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
      createdAt: "",
      addImages: [],
      attachMediaIds: [],
      removeLinkIds: [],
      reorders: [],
      coverImageId: 0,
    });
    setNewImage({
      url: "",
      altText: "",
      caption: "",
      position: 0,
      isCover: false,
    });
    setExistingImages([]);
    setEventDetail(null);
    onClose();
  };

  const addImage = () => {
    if (!newImage.url.trim()) {
      toast.error("Vui lòng nhập URL ảnh!");
      return;
    }

    const imageToAdd = {
      ...newImage,
      position: formData.addImages.length,
    };

    setFormData({
      ...formData,
      addImages: [...formData.addImages, imageToAdd],
    });

    setNewImage({
      url: "",
      altText: "",
      caption: "",
      position: 0,
      isCover: false,
    });
  };

  const removeNewImage = (index: number) => {
    setFormData({
      ...formData,
      addImages: formData.addImages.filter((_, i) => i !== index),
    });
  };

  const setCoverImage = (index: number) => {
    setFormData({
      ...formData,
      addImages: formData.addImages.map((img, i) => ({
        ...img,
        isCover: i === index,
      })),
    });
  };

  const removeExistingImage = (linkId: number) => {
    setFormData({
      ...formData,
      removeLinkIds: [...formData.removeLinkIds, linkId],
    });
    setExistingImages(existingImages.filter((img) => img.linkId !== linkId));
  };

  const setExistingImageAsCover = (mediaId: number) => {
    setFormData({
      ...formData,
      coverImageId: mediaId,
    });
  };

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadPlaces();
      loadEventDetail();
    }
  }, [isOpen, loadCategories, loadPlaces, loadEventDetail]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh sửa Event"
      size="xl"
    >
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 max-h-[80vh] overflow-y-auto">
        {loadingEvent ? (
          <div className="flex justify-center items-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="nhap-slug-event"
                />
              </div>
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
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
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
                rows={6}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                placeholder="Nhập nội dung chi tiết event"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Category (Current: {formData.categoryId})
                </label>
                <select
                  value={formData.categoryId || 0}
                  onChange={(e) => {
                    console.log("Category changed to:", e.target.value);
                    setFormData({
                      ...formData,
                      categoryId: parseInt(e.target.value) || 0,
                    });
                  }}
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
                  Place (Current: {formData.placeId})
                </label>
                <select
                  value={formData.placeId || 0}
                  onChange={(e) => {
                    console.log("Place changed to:", e.target.value);
                    setFormData({
                      ...formData,
                      placeId: parseInt(e.target.value) || 0,
                    });
                  }}
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
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                />
              </div>
            </div>

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
                placeholder="Nhập thông tin giá"
              />
            </div>

            {/* Image Management */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">
                Quản lý ảnh
              </h3>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-white mb-3">
                    Ảnh hiện có
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {existingImages.map((image) => (
                      <div
                        key={image.linkId}
                        className="bg-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            Ảnh {image.position + 1}
                            {image.isCover && (
                              <span className="ml-2 px-2 py-1 bg-ocean-600 text-white text-xs rounded">
                                Bìa
                              </span>
                            )}
                          </span>
                          <div className="flex gap-2">
                            {!image.isCover && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExistingImageAsCover(image.mediaId)
                                }
                                className="text-ocean-400 hover:text-ocean-300 text-sm"
                              >
                                Đặt bìa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.linkId)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                        <img
                          src={image.url}
                          alt={image.altText || ""}
                          loading="lazy"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                          }}
                        />
                        {image.caption && (
                          <p className="text-white/80 text-sm mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Image */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <h4 className="text-md font-medium text-white mb-3">
                  Thêm ảnh mới
                </h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      URL ảnh
                    </label>
                    <input
                      type="url"
                      value={newImage.url}
                      onChange={(e) =>
                        setNewImage({ ...newImage, url: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
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
                        setNewImage({ ...newImage, altText: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                      placeholder="Mô tả ảnh"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">
                      Caption
                    </label>
                    <input
                      type="text"
                      value={newImage.caption}
                      onChange={(e) =>
                        setNewImage({ ...newImage, caption: e.target.value })
                      }
                      disabled={loading}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                      placeholder="Chú thích ảnh"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newImage.isCover}
                        onChange={(e) =>
                          setNewImage({
                            ...newImage,
                            isCover: e.target.checked,
                          })
                        }
                        disabled={loading}
                        className="mr-2"
                      />
                      <span className="text-white">Đặt làm ảnh bìa</span>
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addImage}
                  disabled={loading || !newImage.url.trim()}
                  className="mt-4 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Thêm ảnh
                </button>
              </div>

              {/* New Images List */}
              {formData.addImages.length > 0 && (
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-white mb-3">
                    Ảnh mới sẽ thêm
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.addImages.map((image, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">
                            Ảnh {index + 1}
                            {image.isCover && (
                              <span className="ml-2 px-2 py-1 bg-ocean-600 text-white text-xs rounded">
                                Bìa
                              </span>
                            )}
                          </span>
                          <div className="flex gap-2">
                            {!image.isCover && (
                              <button
                                type="button"
                                onClick={() => setCoverImage(index)}
                                className="text-ocean-400 hover:text-ocean-300 text-sm"
                              >
                                Đặt bìa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                        <img
                          src={image.url}
                          alt={image.altText}
                          loading="lazy"
                          className="w-full h-32 object-cover rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23ccc' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                          }}
                        />
                        {image.caption && (
                          <p className="text-white/80 text-sm mt-1">
                            {image.caption}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  disabled={loading}
                  className="mr-2"
                />
                <span className="text-white">Xuất bản</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white rounded-lg hover:from-ocean-700 hover:to-turquoise-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang cập nhật..." : "Cập nhật Event"}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
