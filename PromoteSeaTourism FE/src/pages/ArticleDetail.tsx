import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { articleService } from "../services/articleService";
import type { ArticleDetail } from "../types/article";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ArticleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const getReadingTime = (text: string): number => {
    const words = text?.trim().split(/\s+/).length || 0;
    return Math.max(1, Math.round(words / 200));
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
        const data = await articleService.getArticleById(Number(id));
        setArticle(data);
      } catch {
        setError("Không thể tải bài viết");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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

  const cover =
    article.images?.find((img) => img.mediaId === article.coverImageId) ||
    article.images?.find((img) => img.isCover) ||
    article.images?.[0];
  const coverUrl = cover?.url || article.thumbnailUrl || "";
  const coverAlt = cover?.altText || article.title;
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
          <div className="flex items-center gap-2">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                location.href
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white text-ocean-700 border border-ocean-200 hover:bg-ocean-50 transition-colors"
            >
              Chia sẻ Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(
                location.href
              )}&text=${encodeURIComponent(article.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white text-ocean-700 border border-ocean-200 hover:bg-ocean-50 transition-colors"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-ocean-600 to-turquoise-600 rounded-2xl text-white p-6 md:p-8 shadow-xl mb-8">
          <div className="text-sm mb-3 flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 font-semibold">
              Danh mục #{article.categoryId}
            </span>
            {article.isPublished && (
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 font-semibold">
                Đã xuất bản
              </span>
            )}
            <span className="opacity-90">•</span>
            <span className="opacity-90">
              {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
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
            <img
              src={coverUrl}
              alt={coverAlt}
              className="w-full h-[380px] md:h-[480px] object-cover"
              loading="lazy"
            />
            {cover?.caption && (
              <div className="px-4 py-2 text-sm text-gray-600 bg-white">
                {cover.caption}
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
                  <li>Danh mục: #{article.categoryId}</li>
                  <li>Slug: {article.slug}</li>
                  <li>
                    Ngày xuất bản:{" "}
                    {new Date(article.publishedAt).toLocaleDateString("vi-VN")}
                  </li>
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
                      <img
                        key={img.linkId}
                        src={img.url}
                        alt={img.altText}
                        className="w-full h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Gallery */}
        {gallery.length > 1 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bộ sưu tập
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((img) => (
                <figure
                  key={img.linkId}
                  className="rounded-2xl overflow-hidden shadow group bg-white"
                >
                  <img
                    src={img.url}
                    alt={img.altText}
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  {img.caption && (
                    <figcaption className="px-4 py-2 text-sm text-gray-600">
                      {img.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
