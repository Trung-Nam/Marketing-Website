import type { Event, EventDetail } from "../types/event";

/**
 * Get cover image URL for an event
 * Priority: coverImage.url -> thumbnailUrl -> coverImageId match -> isCover flag -> first image -> default
 */
export const getEventCoverImageUrl = (event: Event | EventDetail): string => {
  // First priority: use coverImage.url if available
  if (event.coverImage?.url) {
    return event.coverImage.url;
  }

  // Second priority: use thumbnailUrl if available
  if (event.thumbnailUrl) {
    return event.thumbnailUrl;
  }

  // Third priority: try to find cover image from images array
  if (event.images && event.images.length > 0) {
    const coverImage =
      event.images.find((img) => img.id === event.coverImageId) ||
      event.images.find((img) => img.isCover) ||
      event.images[0];
    if (coverImage) {
      return coverImage.url;
    }
  }

  // Fallback to default
  return "/default-avatar.svg";
};

/**
 * Get cover image info for an event (including caption)
 */
export const getEventCoverImageInfo = (
  event: EventDetail
): {
  url: string;
  alt: string;
  caption?: string;
} => {
  // First priority: use coverImage object if available
  if (event.coverImage?.url) {
    return {
      url: event.coverImage.url,
      alt: event.coverImage.altText || event.title,
      caption: event.coverImage.caption,
    };
  }

  // Second priority: use thumbnailUrl if available
  if (event.thumbnailUrl) {
    return {
      url: event.thumbnailUrl,
      alt: event.title,
      caption: undefined,
    };
  }

  // Third priority: try to find cover image from images array
  if (event.images && event.images.length > 0) {
    const coverImage =
      event.images.find((img) => img.id === event.coverImageId) ||
      event.images.find((img) => img.isCover) ||
      event.images[0];
    if (coverImage) {
      return {
        url: coverImage.url,
        alt: coverImage.altText || event.title,
        caption: coverImage.caption,
      };
    }
  }

  // Fallback to default
  return {
    url: "",
    alt: event.title,
    caption: undefined,
  };
};
