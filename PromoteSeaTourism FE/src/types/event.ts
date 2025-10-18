export interface Event {
  id: number;
  title: string;
  slug: string;
  summary: string;
  startTime: string;
  endTime: string;
  address: string;
  priceInfo: string;
  categoryId: number;
  placeId: number;
  isPublished: boolean;
  createdAt: string;
  thumbnailUrl: string;
}

export interface EventListResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Event[];
}

export interface EventListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  placeId?: number;
  isPublished?: boolean;
}

export interface EventDetail {
  id: number;
  title: string;
  slug: string;
  summary: string;
  content?: string;
  startTime: string;
  endTime: string;
  address: string;
  priceInfo: string;
  category?: {
    id: number;
    name: string;
  };
  place?: {
    id: number;
    name: string;
  } | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  thumbnailUrl: string;
  images?: EventImage[];
}

export interface EventImage {
  linkId: number;
  mediaId: number;
  isCover: boolean;
  position: number;
  url: string;
  altText: string;
  caption: string;
}

export interface CreateEventRequest {
  title: string;
  slug: string;
  summary: string;
  content?: string;
  startTime: string;
  endTime: string;
  address: string;
  priceInfo: string;
  categoryId: number;
  placeId: number;
  isPublished: boolean;
  images: EventImageRequest[];
}

export interface EventImageRequest {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface UpdateEventImage {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface ReorderEventImage {
  imageLinkId: number;
  position: number;
}

export interface UpdateEventRequest {
  title: string;
  slug: string;
  summary: string;
  content?: string;
  startTime: string;
  endTime: string;
  address: string;
  priceInfo: string;
  categoryId: number;
  placeId: number;
  isPublished: boolean;
  createdAt: string;
  addImages: UpdateEventImage[];
  attachMediaIds: number[];
  removeLinkIds: number[];
  reorders: ReorderEventImage[];
  coverImageId: number;
}
