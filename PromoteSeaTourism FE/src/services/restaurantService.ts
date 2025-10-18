import api from "../utils/axiosInstance";
import type {
  Restaurant,
  RestaurantDetail,
  RestaurantListResponse,
  RestaurantListParams,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from "../types/restaurant";

export const restaurantService = {
  async getRestaurants(params: RestaurantListParams = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params.categoryId)
      queryParams.append("categoryId", params.categoryId.toString());
    if (params.isPublished !== undefined)
      queryParams.append("isPublished", params.isPublished.toString());

    const response = await api.get<RestaurantListResponse>(
      `/restaurants/list?${queryParams.toString()}`
    );
    return response.data;
  },

  async getRestaurantById(id: number): Promise<RestaurantDetail> {
    const response = await api.get<{ data: RestaurantDetail }>(
      `/restaurants/get/${id}`
    );
    return response.data.data;
  },

  async createRestaurant(restaurantData: CreateRestaurantRequest) {
    const response = await api.post("/restaurants/create", restaurantData);
    return response.data;
  },

  async updateRestaurant(id: number, restaurantData: UpdateRestaurantRequest) {
    const response = await api.put(`/restaurants/update/${id}`, restaurantData);
    return response.data;
  },

  async deleteRestaurant(id: number) {
    const response = await api.delete(`/restaurants/delete/${id}`);
    return response.data;
  },
};
