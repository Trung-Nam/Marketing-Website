export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent: Category | null;
  type: string;
  isActive: boolean;
}

export interface CategoryListResponse {
  code: number;
  message: string;
  total: number;
  page: number;
  pageSize: number;
  data: Category[];
}

export interface CategoryListParams {
  page?: number;
  pageSize?: number;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  type: string;
}

export interface UpdateCategoryRequest {
  name: string;
  slug: string;
  type: string;
  isActive: boolean;
}
