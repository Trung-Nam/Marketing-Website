import api from "../utils/axiosInstance";
import type {
  TourDetail,
  ToursResponse,
  CreateTourRequest,
  UpdateTourRequest,
} from "../types/tour";

export const tourService = {
  // Get list of tours with pagination
  getTours: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: number;
  }): Promise<ToursResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());

    const response = await api.get(`/tours/list?${queryParams.toString()}`);
    return response.data;
  },

  // Get tour by ID
  getTourById: async (id: number): Promise<TourDetail> => {
    const response = await api.get(`/tours/get/${id}`);
    return response.data.data;
  },

  // Create new tour
  createTour: async (data: CreateTourRequest): Promise<TourDetail> => {
    const response = await api.post("/tours/create", data);
    return response.data.data;
  },

  // Update tour
  updateTour: async (
    id: number,
    data: UpdateTourRequest
  ): Promise<TourDetail> => {
    const response = await api.put(`/tours/update/${id}`, data);
    return response.data.data;
  },

  // Delete tour
  deleteTour: async (id: number): Promise<void> => {
    await api.delete(`/tours/delete/${id}`);
  },
};
