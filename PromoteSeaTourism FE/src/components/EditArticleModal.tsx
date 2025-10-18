import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { articleService } from "../services/articleService";
import { categoryService } from "../services/categoryService";
import type {
  Article,
  ArticleDetail,
  UpdateArticleRequest,
  UpdateArticleImage,
} from "../types/article";
import type { Category } from "../types/category";
import Modal from "./Modal";

interface EditArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
  onSuccess?: () => void;
}

export default function EditArticleModal({
  isOpen,
  onClose,
  article,
  onSuccess,
}: EditArticleModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [articleDetail, setArticleDetail] = useState<ArticleDetail | null>(
    null
  );
  const [formData, setFormData] = useState<UpdateArticleRequest>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    categoryId: 0,
    isPublished: false,
    publishedAt: "",
    addImages: [],
    attachMediaIds: [],
    removeLinkIds: [],
    coverImageId: undefined,
  });

  const [newImage, setNewImage] = useState<UpdateArticleImage>({
    url: "",
    altText: "",
    caption: "",
    position: 0,
    isCover: false,
  });

  // Populate form when article changes
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        slug: article.slug,
        summary: article.summary || "",
        content: article.content || "",
        categoryId: article.categoryId || 0,
        isPublished: article.isPublished,
        publishedAt: article.publishedAt || "",
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        coverImageId: article.coverImageId || undefined,
      });
    }
  }, [article]);

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

  const loadArticleDetail = useCallback(async () => {
    if (!article) return;

    try {
      const detail = await articleService.getArticleById(article.id);
      setArticleDetail(detail);
    } catch (error) {
      console.error("Error loading article detail:", error);
      toast.error("Không thể tải chi tiết bài viết!");
    }
  }, [article]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!article) return;

    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error("Vui lòng nhập đầy đủ thông tin bắt buộc!");
      return;
    }

    setLoading(true);
    try {
      await articleService.updateArticle(article.id, formData);
      toast.success("Cập nhật bài viết thành công!");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error updating article:", error);
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
        categoryId: 0,
        isPublished: false,
        publishedAt: "",
        addImages: [],
        attachMediaIds: [],
        removeLinkIds: [],
        coverImageId: undefined,
      });
      setArticleDetail(null);
    }
  };

  const addImage = () => {
    if (newImage.url.trim()) {
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
    }
  };

  const removeNewImage = (index: number) => {
    setFormData({
      ...formData,
      addImages: formData.addImages.filter((_, i) => i !== index),
    });
  };

  const setCoverNewImage = (index: number) => {
    setFormData({
      ...formData,
      addImages: formData.addImages.map((img, i) => ({
        ...img,
        isCover: i === index,
      })),
      coverImageId: undefined, // Clear coverImageId when setting new cover
    });
  };

  // Existing images management
  const removeExistingImage = (linkId: number) => {
    setFormData({
      ...formData,
      removeLinkIds: [...formData.removeLinkIds, linkId],
    });
  };

  const setCoverExistingImage = (mediaId: number) => {
    setFormData({
      ...formData,
      coverImageId: mediaId,
      // Clear any new image cover selection
      addImages: formData.addImages.map((img) => ({ ...img, isCover: false })),
    });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `ID: ${categoryId}`;
  };

  // Load categories and article details when modal opens
  useEffect(() => {
    if (isOpen && article) {
      loadCategories();
      loadArticleDetail();
    }
  }, [isOpen, article, loadCategories, loadArticleDetail]);

  if (!isOpen || !article) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Chỉnh Sửa Bài Viết"
      size="xl"
    >
      {/* Form */}
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
              placeholder="Nhập tiêu đề bài viết"
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
              placeholder="bai-viet-slug"
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
                Ngày xuất bản
              </label>
              <input
                type="datetime-local"
                value={
                  formData.publishedAt ? formData.publishedAt.slice(0, 16) : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    publishedAt: e.target.value
                      ? new Date(e.target.value).toISOString()
                      : "",
                  })
                }
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white"
              />
            </div>
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
              placeholder="Nhập tóm tắt bài viết"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-white/60 resize-none"
              placeholder="Nhập nội dung bài viết"
            />
          </div>

          {/* Current Category Info */}
          {article.categoryId > 0 && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-200">
                <strong>Category hiện tại:</strong>{" "}
                {getCategoryName(article.categoryId)}
              </p>
            </div>
          )}

          {/* Existing Images Section */}
          {articleDetail?.images && articleDetail.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Hình ảnh hiện có (
                {
                  articleDetail.images.filter(
                    (img) => !formData.removeLinkIds.includes(img.linkId)
                  ).length
                }
                )
              </label>

              <div className="space-y-2">
                {articleDetail.images
                  .filter((img) => !formData.removeLinkIds.includes(img.linkId))
                  .sort((a, b) => a.position - b.position)
                  .map((image) => (
                    <div
                      key={image.linkId}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={image.url}
                          alt={image.altText || ""}
                          className="w-12 h-12 object-cover rounded border border-white/20"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                          }}
                        />
                        <div className="text-white text-sm">
                          <div className="font-medium">
                            {image.caption || "No caption"}
                          </div>
                          <div className="text-white/60">
                            {image.altText || "No alt text"}
                          </div>
                          <div className="text-white/40 text-xs">
                            Position: {image.position}
                          </div>
                        </div>
                        {image.isCover && (
                          <span className="px-2 py-1 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                            Bìa
                          </span>
                        )}
                        {formData.coverImageId === image.mediaId &&
                          !image.isCover && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded border border-blue-500/30">
                              Sẽ là bìa
                            </span>
                          )}
                      </div>

                      <div className="flex gap-2">
                        {/* Set Cover Button */}
                        {!image.isCover &&
                          formData.coverImageId !== image.mediaId && (
                            <button
                              type="button"
                              onClick={() =>
                                setCoverExistingImage(image.mediaId)
                              }
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                            >
                              Đặt bìa
                            </button>
                          )}

                        {/* Remove Button */}
                        <button
                          type="button"
                          onClick={() => removeExistingImage(image.linkId)}
                          className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Add Images Section */}
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
                  onClick={addImage}
                  className="px-3 py-1 bg-white/20 text-white rounded text-sm hover:bg-white/30 transition-colors"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* New Images List */}
            {formData.addImages.length > 0 && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-white/80">
                  Hình ảnh mới sẽ được thêm:
                </p>
                {formData.addImages.map((img, index) => (
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
                          onClick={() => setCoverNewImage(index)}
                          className="px-2 py-1 bg-white/20 text-white rounded text-xs hover:bg-white/30 transition-colors"
                        >
                          Đặt bìa
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
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
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 font-medium"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {loading ? "Đang cập nhật..." : "Cập Nhật Bài Viết"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
