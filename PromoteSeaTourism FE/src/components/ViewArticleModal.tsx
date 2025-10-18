import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { articleService } from "../services/articleService";
import { categoryService } from "../services/categoryService";
import type { Article, ArticleDetail } from "../types/article";
import type { Category } from "../types/category";
import Modal from "./Modal";
import LoadingSpinner from "./LoadingSpinner";

interface ViewArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article | null;
}

export default function ViewArticleModal({
  isOpen,
  onClose,
  article,
}: ViewArticleModalProps) {
  const [loading, setLoading] = useState(false);
  const [articleDetail, setArticleDetail] = useState<ArticleDetail | null>(
    null
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Load article details and categories when modal opens
  useEffect(() => {
    if (isOpen && article) {
      loadArticleDetail();
      loadCategories();
    }
  }, [isOpen, article]);

  const loadArticleDetail = async () => {
    if (!article) return;

    setLoading(true);
    try {
      const detail = await articleService.getArticleById(article.id);
      setArticleDetail(detail);
    } catch (error) {
      console.error("Error loading article detail:", error);
      toast.error("Không thể tải chi tiết bài viết!");
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
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
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : `ID: ${categoryId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOpen || !article) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xem Chi Tiết Bài Viết"
      size="xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : articleDetail ? (
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
                      {articleDetail.id}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Tiêu đề:</span>
                    <p className="ml-2 text-white font-medium">
                      {articleDetail.title}
                    </p>
                  </div>
                  <div>
                    <span className="text-white/60">Slug:</span>
                    <span className="ml-2 text-white font-mono text-xs">
                      {articleDetail.slug}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Category:</span>
                    <span className="ml-2 text-white font-medium">
                      {getCategoryName(articleDetail.categoryId)}
                    </span>
                  </div>
                  <div>
                    <span className="text-white/60">Trạng thái:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        articleDetail.isPublished
                          ? "bg-green-500/20 text-green-300 border border-green-500/30"
                          : "bg-gray-500/20 text-gray-300 border border-gray-500/30"
                      }`}
                    >
                      {articleDetail.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Thời gian
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-white/60">Ngày tạo:</span>
                    <p className="ml-2 text-white">
                      {formatDate(articleDetail.createdAt)}
                    </p>
                  </div>
                  {articleDetail.updatedAt && (
                    <div>
                      <span className="text-white/60">Ngày cập nhật:</span>
                      <p className="ml-2 text-white">
                        {formatDate(articleDetail.updatedAt)}
                      </p>
                    </div>
                  )}
                  {articleDetail.publishedAt && (
                    <div>
                      <span className="text-white/60">Ngày xuất bản:</span>
                      <p className="ml-2 text-white">
                        {formatDate(articleDetail.publishedAt)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            {articleDetail.summary && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Tóm tắt
                </h3>
                <p className="text-white/80 leading-relaxed">
                  {articleDetail.summary}
                </p>
              </div>
            )}

            {/* Content */}
            {articleDetail.content && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Nội dung
                </h3>
                <div className="text-white/80 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {articleDetail.content}
                </div>
              </div>
            )}

            {/* Images */}
            {articleDetail.images && articleDetail.images.length > 0 && (
              <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Hình ảnh ({articleDetail.images.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {articleDetail.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.altText || ""}
                        className="w-full h-24 object-cover rounded border border-white/20"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24'%3E%3Cpath fill='%23fff' d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                        }}
                      />
                      {image.isCover && (
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white text-xs rounded">
                          Bìa
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="truncate">
                          {image.caption || "No caption"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Image Info */}
            {articleDetail.coverImageId && (
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-sm text-blue-200">
                  <strong>Cover Image ID:</strong> {articleDetail.coverImageId}
                </p>
                {articleDetail.thumbnailUrl && (
                  <p className="text-sm text-blue-200 mt-1">
                    <strong>Thumbnail URL:</strong> {articleDetail.thumbnailUrl}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-white/60">Không thể tải chi tiết bài viết</p>
          </div>
        )}

        {/* Close Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
