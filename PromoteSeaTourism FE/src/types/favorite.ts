export interface FavoriteId {
  userId: number;
  targetType: number;
  targetId: number;
}

export interface FavoriteItem {
  id: number;
  name: string;
  slug: string;
  summary: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;
  type: string;
}

export interface Favorite {
  favoriteId: FavoriteId;
  createdAt: string;
  item: FavoriteItem;
}

export interface FavoritesResponse {
  code: number;
  message: string;
  data: Favorite[];
}

export interface FavoritesListResponse {
  code: number;
  message: string;
  data: Favorite[];
}

// Target types mapping
export const TARGET_TYPES = {
  CATEGORY: 0,
  ARTICLE: 1,
  EVENT: 2,
  RESTAURANT: 3,
  ACCOMMODATION: 4,
  PLACE: 5,
  TOUR: 6,
} as const;

export const TARGET_TYPE_NAMES = {
  [TARGET_TYPES.CATEGORY]: "Danh mục",
  [TARGET_TYPES.ARTICLE]: "Bài viết",
  [TARGET_TYPES.EVENT]: "Sự kiện",
  [TARGET_TYPES.RESTAURANT]: "Nhà hàng",
  [TARGET_TYPES.ACCOMMODATION]: "Nơi nghỉ",
  [TARGET_TYPES.PLACE]: "Địa điểm",
  [TARGET_TYPES.TOUR]: "Tour",
} as const;

export type TargetType = keyof typeof TARGET_TYPES;
