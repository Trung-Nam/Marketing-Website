import api from "../utils/axiosInstance";
import type {
  PlaceListResponse,
  PlaceListParams,
  PlaceDetail,
  CreatePlaceRequest,
  UpdatePlaceRequest,
} from "../types/place";

export const placeService = {
  async getPlaces(params: PlaceListParams) {
    const response = await api.get<PlaceListResponse>("/places/list", {
      params,
    });
    return response.data;
  },

  async getPlaceById(id: number) {
    const response = await api.get<{
      code: number;
      message: string;
      data: PlaceDetail;
    }>(`/places/get/${id}`);
    return response.data;
  },

  async createPlace(placeData: CreatePlaceRequest) {
    const response = await api.post("/places/create", placeData);
    return response.data;
  },

  async updatePlace(id: number, placeData: UpdatePlaceRequest) {
    console.log("Sending PUT request to:", `/places/update/${id}`);
    console.log("Request body:", placeData);
    const response = await api.put(`/places/update/${id}`, placeData);
    return response.data;
  },

  async deletePlace(id: number) {
    const response = await api.delete(`/places/delete/${id}`);
    return response.data;
  },
};
