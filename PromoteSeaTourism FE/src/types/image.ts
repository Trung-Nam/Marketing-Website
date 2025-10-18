export interface Image {
  id: number;
  url: string;
  altText: string | null;
  caption: string | null;
  createdBy: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface ImageListResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Image[];
}

export interface ImageListParams {
  page: number;
  pageSize: number;
}
