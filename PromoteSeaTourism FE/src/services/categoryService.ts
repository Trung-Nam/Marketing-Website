import api from "../utils/axiosInstance";
import {
  Category,
  CategoryListResponse,
  CategoryListParams,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "../types/category";

export const categoryService = {
  // Lấy danh sách categories với pagination
  getCategories: async (
    params: CategoryListParams = {}
  ): Promise<CategoryListResponse> => {
    const { page = 1, pageSize = 20 } = params;

    const response = await api.get(`/categories/list`, {
      params: {
        page,
        pageSize,
      },
    });

    return response.data;
  },

  // Lấy chi tiết category theo ID
  getCategoryById: async (id: number) => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Tạo category mới
  createCategory: async (categoryData: CreateCategoryRequest) => {
    const response = await api.post("/categories/create", categoryData);
    return response.data;
  },

  // Cập nhật category
  updateCategory: async (id: number, categoryData: UpdateCategoryRequest) => {
    const response = await api.put(`/categories/update/${id}`, categoryData);
    return response.data;
  },

  // Xóa category
  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/delete/${id}`);
    return response.data;
  },

  // Kích hoạt/vô hiệu hóa category
  toggleCategoryStatus: async (id: number, isActive: boolean) => {
    const response = await api.patch(`/categories/${id}/status`, {
      isActive,
    });
    return response.data;
  },
};
