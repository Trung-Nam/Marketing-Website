export interface Place {
  id: number;
  name: string;
  slug: string;
  summary: string;
  address: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  geolat: number | null;
  geolng: number | null;
  bestSeason: string;
  ticketInfo: string | null;
  openingHours: string | null;
  coverImageId: number;
  thumbnailUrl: string;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlaceListResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Place[];
}

export interface PlaceListParams {
  page: number;
  pageSize: number;
}

export interface PlaceDetail {
  id: number;
  name: string;
  slug: string;
  summary: string;
  content: string | null;
  address: string;
  province: string | null;
  district: string | null;
  ward: string | null;
  geolat: number | null;
  geolng: number | null;
  bestSeason: string;
  ticketInfo: string | null;
  openingHours: string | null;
  coverImageId: number;
  thumbnailUrl: string;
  categoryId: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface PlaceImage {
  linkId: number;
  mediaId: number;
  isCover: boolean;
  position: number;
  url: string;
  altText: string | null;
  caption: string | null;
}

export interface CreatePlaceRequest {
  name: string;
  slug: string;
  summary: string;
  content?: string | null;
  address: string;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  geolat?: number | null;
  geolng?: number | null;
  bestSeason: string;
  ticketInfo?: string | null;
  openingHours?: string | null;
  categoryId: number;
  coverImageId?: number | null;
  isPublished: boolean;
}

export interface UpdatePlaceRequest {
  name: string;
  slug: string;
  summary: string;
  content?: string | null;
  address: string;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  geolat?: number | null;
  geolng?: number | null;
  bestSeason: string;
  ticketInfo?: string | null;
  openingHours?: string | null;
  categoryId: number;
  coverImageId?: number | null;
  isPublished: boolean;
}

export interface PlaceImageRequest {
  url: string;
  altText?: string;
  caption?: string;
  position: number;
  isCover: boolean;
}

export interface UpdatePlaceImage {
  url: string;
  altText?: string;
  caption?: string;
  position: number;
  isCover: boolean;
}

export interface ReorderPlaceImage {
  imageLinkId: number;
  position: number;
}
