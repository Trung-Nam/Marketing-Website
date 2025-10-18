export interface Tour {
  id: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  priceFrom: number;
  itinerary: string;
  categoryId: number;
  createdAt: string;
  thumbnailUrl: string;
}

export interface TourDetail extends Tour {
  category?: {
    id: number;
    name: string;
  };
  images?: TourImage[];
  isPublished?: boolean;
  updatedAt?: string;
}

export interface TourImage {
  linkId: number;
  mediaId: number;
  url: string;
  caption: string;
  altText: string;
  isCover: boolean;
  position: number;
}

export interface ToursResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Tour[];
}

export interface CreateTourRequest {
  name: string;
  slug: string;
  summary: string;
  description: string;
  priceFrom: number;
  itinerary: string;
  categoryId: number;
  isPublished: boolean;
  images: CreateTourImage[];
  attachMediaIds?: number[];
  coverImageId?: number;
}

export interface UpdateTourRequest {
  name: string;
  slug: string;
  summary: string;
  description: string;
  priceFrom: number;
  itinerary: string;
  categoryId: number;
  isPublished: boolean;
  addImages?: CreateTourImage[];
  attachMediaIds?: number[];
  removeLinkIds?: number[];
  reorders?: ReorderTourImage[];
  coverImageId?: number;
}

export interface CreateTourImage {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface ReorderTourImage {
  imageLinkId: number;
  position: number;
}
