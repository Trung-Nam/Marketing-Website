import api from "../utils/axiosInstance";
import type {
  TourDetail,
  ToursResponse,
  CreateTourRequest,
  UpdateTourRequest,
} from "../types/tour";

export const tourService = {
  // Get list of tours with pagination
  getTours: async (
    page: number = 1,
    pageSize: number = 20
  ): Promise<ToursResponse> => {
    const response = await api.get(
      `/tours/list?page=${page}&pageSize=${pageSize}`
    );
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
