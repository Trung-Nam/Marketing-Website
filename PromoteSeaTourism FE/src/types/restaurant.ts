export interface Restaurant {
  id: number;
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone: string | null;
  website: string | null;
  priceRangeText: string;
  coverImageId: number;
  thumbnailUrl: string;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
  images?: RestaurantImage[];
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  coverImage?: {
    id: number;
    url: string;
    altText: string;
    caption: string;
  };
}

export interface RestaurantListResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Restaurant[];
}

export interface RestaurantListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  isPublished?: boolean;
}

export interface RestaurantDetail {
  id: number;
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone: string | null;
  website: string | null;
  priceRangeText: string;
  coverImageId: number;
  thumbnailUrl: string;
  categoryId: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
  images?: RestaurantImage[];
  coverImage?: {
    id: number;
    url: string;
    altText: string;
    caption: string;
  };
}

export interface RestaurantImage {
  linkId: number;
  mediaId: number;
  isCover: boolean;
  position: number;
  url: string;
  altText: string;
  caption: string;
}

export interface CreateRestaurantRequest {
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone?: string;
  website?: string;
  priceRangeText: string;
  categoryId: number;
  isPublished: boolean;
  images: RestaurantImageRequest[];
}

export interface RestaurantImageRequest {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface UpdateRestaurantRequest {
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone?: string;
  website?: string;
  priceRangeText: string;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  addImages: UpdateRestaurantImage[];
  attachMediaIds: number[];
  removeLinkIds: number[];
  reorders: ReorderRestaurantImage[];
  coverImageId: number;
}

export interface UpdateRestaurantImage {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface ReorderRestaurantImage {
  imageLinkId: number;
  position: number;
}
