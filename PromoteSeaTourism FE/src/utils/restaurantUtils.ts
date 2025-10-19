import type { Restaurant, RestaurantDetail } from "../types/restaurant";

/**
 * Get cover image URL for a restaurant
 * Priority: coverImage.url -> thumbnailUrl -> coverImageId match -> isCover flag -> first image -> default
 */
export const getRestaurantCoverImageUrl = (
  restaurant: Restaurant | RestaurantDetail
): string => {
  // First priority: use coverImage.url if available
  if (restaurant.coverImage?.url) {
    return restaurant.coverImage.url;
  }

  // Second priority: use thumbnailUrl if available
  if (restaurant.thumbnailUrl) {
    return restaurant.thumbnailUrl;
  }

  // Third priority: try to find cover image from images array
  if (restaurant.images && restaurant.images.length > 0) {
    const coverImage =
      restaurant.images.find(
        (img) => img.mediaId === restaurant.coverImageId
      ) ||
      restaurant.images.find((img) => img.isCover) ||
      restaurant.images[0];
    if (coverImage) {
      return coverImage.url;
    }
  }

  // Fallback to default
  return "/default-avatar.svg";
};

/**
 * Get cover image info for a restaurant (including caption)
 */
export const getRestaurantCoverImageInfo = (
  restaurant: RestaurantDetail
): {
  url: string;
  alt: string;
  caption?: string;
} => {
  // First priority: use coverImage object if available
  if (restaurant.coverImage?.url) {
    return {
      url: restaurant.coverImage.url,
      alt: restaurant.coverImage.altText || restaurant.name,
      caption: restaurant.coverImage.caption,
    };
  }

  // Second priority: use thumbnailUrl if available
  if (restaurant.thumbnailUrl) {
    return {
      url: restaurant.thumbnailUrl,
      alt: restaurant.name,
      caption: undefined,
    };
  }

  // Third priority: try to find cover image from images array
  if (restaurant.images && restaurant.images.length > 0) {
    const coverImage =
      restaurant.images.find(
        (img) => img.mediaId === restaurant.coverImageId
      ) ||
      restaurant.images.find((img) => img.isCover) ||
      restaurant.images[0];
    if (coverImage) {
      return {
        url: coverImage.url,
        alt: coverImage.altText || restaurant.name,
        caption: coverImage.caption,
      };
    }
  }

  // Fallback to default
  return {
    url: "",
    alt: restaurant.name,
    caption: undefined,
  };
};
