import type { Article, ArticleDetail } from "../types/article";

/**
 * Get cover image URL for an article
 * Priority: thumbnailUrl -> coverImageId match -> isCover flag -> first image -> default
 */
export const getCoverImageUrl = (article: Article | ArticleDetail): string => {
  // First priority: use thumbnailUrl if available
  if (article.thumbnailUrl) {
    return article.thumbnailUrl;
  }

  // Second priority: try to find cover image from images array
  if (article.images && article.images.length > 0) {
    const coverImage =
      article.images.find((img) => img.mediaId === article.coverImageId) ||
      article.images.find((img) => img.isCover) ||
      article.images[0];
    if (coverImage) {
      return coverImage.url;
    }
  }

  // Fallback to default
  return "/default-avatar.svg";
};

/**
 * Get cover image info for an article (including caption)
 */
export const getCoverImageInfo = (
  article: ArticleDetail
): {
  url: string;
  alt: string;
  caption?: string;
} => {
  // First priority: use thumbnailUrl if available
  if (article.thumbnailUrl) {
    return {
      url: article.thumbnailUrl,
      alt: article.title,
      caption: undefined,
    };
  }

  // Second priority: try to find cover image from images array
  if (article.images && article.images.length > 0) {
    const coverImage =
      article.images.find((img) => img.mediaId === article.coverImageId) ||
      article.images.find((img) => img.isCover) ||
      article.images[0];
    if (coverImage) {
      return {
        url: coverImage.url,
        alt: coverImage.altText || article.title,
        caption: coverImage.caption,
      };
    }
  }

  // Fallback to default
  return {
    url: "",
    alt: article.title,
    caption: undefined,
  };
};
