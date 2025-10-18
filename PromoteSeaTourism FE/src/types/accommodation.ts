export interface AccommodationImage {
  linkId: number;
  mediaId: number;
  isCover: boolean;
  position: number;
  url: string;
  altText: string;
  caption: string;
}

export interface Accommodation {
  id: number;
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone: string | null;
  website: string | null;
  star: number | null;
  minPrice: number;
  maxPrice: number;
  coverImageId: number | null;
  thumbnailUrl: string;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface AccommodationDetail extends Accommodation {
  images: AccommodationImage[];
}

export interface AccommodationListResponse {
  data: Accommodation[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AccommodationListParams {
  page?: number;
  pageSize?: number;
  categoryId?: number;
  isPublished?: boolean;
}

export interface AccommodationImageRequest {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface CreateAccommodationRequest {
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone: string;
  website: string;
  star: number;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
  isPublished: boolean;
  images: AccommodationImageRequest[];
}

export interface UpdateAccommodationImage {
  url: string;
  altText: string;
  caption: string;
  position: number;
  isCover: boolean;
}

export interface ReorderImage {
  imageLinkId: number;
  position: number;
}

export interface UpdateAccommodationRequest {
  name: string;
  slug: string;
  summary: string;
  content: string;
  address: string;
  phone: string;
  website: string;
  star: number;
  minPrice: number;
  maxPrice: number;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  addImages: UpdateAccommodationImage[];
  attachMediaIds: number[];
  removeLinkIds: number[];
  reorders: ReorderImage[];
  coverImageId: number;
}
