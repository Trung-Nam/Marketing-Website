import type { Article, ArticleDetail } from "../types/article";

/**
 * Get cover image URL for an article
 * Priority: coverImage.url -> thumbnailUrl -> coverImageId match -> isCover flag -> first image -> default
 */
export const getCoverImageUrl = (article: Article | ArticleDetail): string => {
  // First priority: use coverImage.url if available
  if (article.coverImage?.url) {
    return article.coverImage.url;
  }

  // Second priority: use thumbnailUrl if available
  if (article.thumbnailUrl) {
    return article.thumbnailUrl;
  }

  // Third priority: try to find cover image from images array
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
  // First priority: use coverImage object if available
  if (article.coverImage?.url) {
    return {
      url: article.coverImage.url,
      alt: article.coverImage.altText || article.title,
      caption: article.coverImage.caption,
    };
  }

  // Second priority: use thumbnailUrl if available
  if (article.thumbnailUrl) {
    return {
      url: article.thumbnailUrl,
      alt: article.title,
      caption: undefined,
    };
  }

  // Third priority: try to find cover image from images array
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
