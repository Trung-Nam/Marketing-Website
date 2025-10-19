import { Tour, TourDetail } from "../types/tour";

/**
 * Get cover image URL for tour list display
 */
export const getTourCoverImageUrl = (tour: Tour | TourDetail): string => {
  // First priority: find cover image from images array
  if (tour.images && tour.images.length > 0) {
    const coverImage = tour.images.find((img) => img.isCover) || tour.images[0];
    if (coverImage) {
      return coverImage.url;
    }
  }

  // Second priority: use thumbnailUrl if available
  if (tour.thumbnailUrl) {
    return tour.thumbnailUrl;
  }

  // Fallback to default
  return "/default-avatar.svg";
};

/**
 * Get cover image info for tour detail display
 */
export const getTourCoverImageInfo = (
  tour: TourDetail
): {
  url: string;
  alt: string;
  caption?: string;
} => {
  // First priority: find cover image from images array
  if (tour.images && tour.images.length > 0) {
    const coverImage = tour.images.find((img) => img.isCover) || tour.images[0];
    if (coverImage) {
      return {
        url: coverImage.url,
        alt: coverImage.altText || tour.name,
        caption: coverImage.caption,
      };
    }
  }

  // Second priority: use thumbnailUrl if available
  if (tour.thumbnailUrl) {
    return {
      url: tour.thumbnailUrl,
      alt: tour.name,
      caption: undefined,
    };
  }

  // Fallback to default
  return {
    url: "/default-avatar.svg",
    alt: tour.name,
    caption: undefined,
  };
};

/**
 * Get other images (excluding cover image) for detail display
 */
export const getOtherTourImages = (tour: TourDetail) => {
  if (!tour.images || tour.images.length === 0) {
    return [];
  }

  const coverImage = tour.images.find((img) => img.isCover);
  return tour.images.filter((img) => img !== coverImage);
};
