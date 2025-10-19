import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articleService } from "../services/articleService";
import { categoryService } from "../services/categoryService";
import type { ArticleDetail } from "../types/article";
import type { Category } from "../types/category";
import LoadingSpinner from "../components/LoadingSpinner";
import { getCoverImageInfo } from "../utils/articleUtils";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    alt: string;
    caption?: string;
  } | null>(null);
  const getReadingTime = (text: string): number => {
    const words = text?.trim().split(/\s+/).length || 0;
    return Math.max(1, Math.round(words / 200));
  };

  const getCategoryName = (categoryId: number): string => {
    console.log("Looking for categoryId:", categoryId);
    console.log("Available categories:", categories);
    const category = categories.find((cat) => cat.id === categoryId);
    console.log("Found category:", category);
    return category?.name || "Khác";
  };

  const openLightbox = (url: string, alt: string, caption?: string) => {
    setLightboxImage({ url, alt, caption });
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!id) {
          setError("Không tìm thấy bài viết");
          return;
        }

        // Load article and categories in parallel
        const [articleData, categoriesData] = await Promise.all([
          articleService.getArticleById(Number(id)),
          categoryService.getCategories({ page: 1, pageSize: 100 }),
        ]);

        console.log("Article data:", articleData);
        console.log("Categories data:", categoriesData);
        console.log("Categories array:", categoriesData.data);

        setArticle(articleData);
        setCategories(categoriesData.data);
      } catch {
        setError("Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Keyboard support for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && lightboxImage) {
        closeLightbox();
      }
    };

    if (lightboxImage) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [lightboxImage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <LoadingSpinner />
              <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-20 pb-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <p className="text-red-700">{error ?? "Không tìm thấy bài viết"}</p>
          </div>
        </div>
      </div>
    );
  }

  const coverInfo = getCoverImageInfo(article);
  const coverUrl = coverInfo.url;
  const coverAlt = coverInfo.alt;
  const gallery = (article.images ?? []).sort(
    (a, b) => a.position - b.position
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 pt-6 pb-12">
      {/* Breadcrumb + Share (Top) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
          <div className="text-gray-500">
            <button
              onClick={() => navigate(-1)}
              className="hover:text-ocean-600 cursor-pointer"
            >
              ← Quay lại
            </button>
            <span className="mx-2">/</span>
            <button
              onClick={() => navigate("/articles")}
              className="hover:text-ocean-600 cursor-pointer"
            >
              Bài viết
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                />
              </svg>
              Chia sẻ
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              Yêu thích
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-ocean-600 to-turquoise-600 rounded-2xl text-white p-6 md:p-8 shadow-xl mb-8">
          <div className="text-sm mb-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 font-semibold">
              {article ? getCategoryName(article.categoryId) : "Danh mục"}
            </span>
            {article.isPublished && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 font-semibold">
                Đã xuất bản
              </span>
            )}
            <span className="opacity-90">•</span>
            <span className="opacity-90">
              {new Date(article.createdAt).toLocaleDateString("vi-VN")}
            </span>
            <span className="opacity-90">•</span>
            <span className="opacity-90">
              {getReadingTime(article.content)} phút đọc
            </span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            {article.title}
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cover */}
        {coverUrl && (
          <div className="rounded-2xl overflow-hidden shadow-xl mb-10">
            <button
              onClick={() =>
                openLightbox(coverUrl, coverAlt, coverInfo.caption)
              }
              className="group relative w-full h-[380px] md:h-[480px] overflow-hidden"
            >
              <img
                src={coverUrl}
                alt={coverAlt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                  <svg
                    className="w-16 h-16 mx-auto mb-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  <p className="text-lg font-semibold">Click để xem ảnh</p>
                </div>
              </div>
            </button>
            {coverInfo.caption && (
              <div className="px-4 py-2 text-sm text-gray-600 bg-white text-center text-italic">
                {coverInfo.caption}
              </div>
            )}
          </div>
        )}

        {/* Content + Aside */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <article className="prose prose-lg max-w-none prose-img:rounded-xl prose-headings:text-gray-900 prose-p:text-gray-700">
              <p className="text-xl text-gray-700 mb-6">{article.summary}</p>
              <div className="whitespace-pre-line leading-8 text-gray-800">
                {article.content}
              </div>
            </article>
          </div>
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Thông tin bài viết
                </h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Mã bài viết: {article.id}</li>
                  <li>Danh mục: {getCategoryName(article.categoryId)}</li>
                  <li>Slug: {article.slug}</li>
                  <li>
                    Ngày tạo:{" "}
                    {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                  </li>
                  {article.updatedAt && (
                    <li>
                      Cập nhật gần đây:{" "}
                      {new Date(article.updatedAt).toLocaleDateString("vi-VN")}
                    </li>
                  )}
                  <li>Thời gian đọc: {getReadingTime(article.content)} phút</li>
                </ul>
              </div>
              {gallery.length > 1 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Hình ảnh nổi bật
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {gallery.slice(0, 6).map((img) => (
                      <button
                        key={img.linkId}
                        onClick={() =>
                          openLightbox(img.url, img.altText, img.caption)
                        }
                        className="group relative overflow-hidden rounded-lg"
                      >
                        <img
                          src={img.url}
                          alt={img.altText}
                          className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                            />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <div className="relative max-w-7xl max-h-full">
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors"
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.alt}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              {lightboxImage.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                  <p className="text-center italic">{lightboxImage.caption}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
