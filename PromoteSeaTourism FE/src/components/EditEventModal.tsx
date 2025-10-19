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
  const [detailLoading, setDetailLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [places, setPlaces] = useState<Place[]>([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [eventDetail, setEventDetail] = useState<EventDetail | null>(null);
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

  const [newImages, setNewImages] = useState<EventImageRequest[]>([]);
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

  const loadEventDetail = useCallback(async () => {
    if (!event) return;

    setDetailLoading(true);
    try {
      const eventData = await eventService.getEventById(event.id);
      setEventDetail(eventData);

      // Populate form with existing data
      setFormData({
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
        coverImageId: 0,
      });
    } catch (error) {
      console.error("Error loading event detail:", error);
      toast.error("Không thể tải thông tin event!");
    } finally {
      setDetailLoading(false);
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên event!");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Vui lòng nhập slug!");
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

    if (formData.categoryId === 0) {
      toast.error("Vui lòng chọn category!");
      return;
    }

    if (formData.placeId === 0) {
      toast.error("Vui lòng chọn place!");
      return;
    }

    if (!event) return;

    setLoading(true);
    try {
      const updateData: UpdateEventRequest = {
        ...formData,
        addImages: newImages.filter((img) => img.url.trim() !== ""),
      };

      await eventService.updateEvent(event.id, updateData);
      toast.success("Cập nhật event thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating event:", error);
      // Error message is already shown by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !detailLoading) {
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
      setEventDetail(null);
    }
  };

  const addNewImage = () => {
    if (!newImage.url.trim()) {
      toast.error("Vui lòng nhập URL hình ảnh!");
      return;
    }

    const imageToAdd: EventImageRequest = {
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

  // Load data when modal opens
  useEffect(() => {
    if (isOpen && event) {
      loadEventDetail();
      loadCategories();
      loadPlaces();
    }
  }, [isOpen, event, loadEventDetail, loadCategories, loadPlaces]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
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
      setNewImages([]);
      setNewImage({
        url: "",
        altText: "",
        caption: "",
        position: 0,
        isCover: false,
      });
      setEventDetail(null);
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh Sửa Event"
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
                  Tên Event *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60"
                  placeholder="Nhập tên event"
                  required
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
                  placeholder="event-slug"
                  required
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
                    value={formData.categoryId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        categoryId: parseInt(e.target.value) || 0,
                      });
                    }}
                    disabled={loading || categoriesLoading}
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

              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Place *
                </label>
                {placesLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner />
                    <span className="ml-2 text-white">Đang tải places...</span>
                  </div>
                ) : (
                  <select
                    value={formData.placeId}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        placeId: parseInt(e.target.value) || 0,
                      });
                    }}
                    disabled={loading || placesLoading}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
                    required
                  >
                    <option value={0} className="bg-gray-800 text-white">
                      Chọn place
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
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  required
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
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  required
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
            </div>

            {/* Current Images */}
            {eventDetail &&
              eventDetail.images &&
              eventDetail.images.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm text-white/80 mb-2">
                    Hình ảnh hiện tại:
                  </p>
                  <div className="space-y-2">
                    {eventDetail.images
                      .filter(
                        (image) => !formData.removeLinkIds.includes(image.id)
                      )
                      .map((image) => (
                        <div
                          key={image.id}
                          className="flex items-center justify-between p-2 bg-white/5 rounded border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={image.url}
                              alt={image.altText || ""}
                              loading="lazy"
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
                            {image.isCover && (
                              <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                                Bìa
                              </span>
                            )}
                            {formData.coverImageId === image.id && (
                              <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                                Sẽ là bìa
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {formData.coverImageId !== image.id && (
                              <button
                                type="button"
                                onClick={() => setCoverExistingImage(image.id)}
                                className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                              >
                                Đặt bìa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeExistingImage(image.id)}
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
                          loading="lazy"
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

            {/* Published Status */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  disabled={loading}
                  className="h-4 w-4 text-white/60 focus:ring-white/50 border-white/20 rounded bg-white/10"
                />
                <span className="text-white">Xuất bản event</span>
              </label>
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
                {loading ? "Đang cập nhật..." : "Cập nhật Event"}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
