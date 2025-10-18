import api from "../utils/axiosInstance";
import type {
  Accommodation,
  AccommodationDetail,
  AccommodationListResponse,
  AccommodationListParams,
  CreateAccommodationRequest,
  UpdateAccommodationRequest,
} from "../types/accommodation";

export const accommodationService = {
  async getAccommodations(params: AccommodationListParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.isPublished !== undefined)
      queryParams.append("isPublished", params.isPublished.toString());

    const response = await api.get<AccommodationListResponse>(
      `/accommodations/list?${queryParams.toString()}`
    );
    return response.data;
  },

  async getAccommodationById(id: number): Promise<AccommodationDetail> {
    const response = await api.get<{ data: AccommodationDetail }>(
      `/accommodations/get/${id}`
    );
    return response.data.data;
  },

  async createAccommodation(accommodationData: CreateAccommodationRequest) {
    const response = await api.post(
      "/accommodations/create",
      accommodationData
    );
    return response.data;
  },

  async updateAccommodation(
    id: number,
    accommodationData: UpdateAccommodationRequest
  ) {
    const response = await api.put(
      `/accommodations/update/${id}`,
      accommodationData
    );
    return response.data;
  },

  async deleteAccommodation(id: number) {
    const response = await api.delete(`/accommodations/delete/${id}`);
    return response.data;
  },
};
