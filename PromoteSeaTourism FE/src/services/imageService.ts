import api from "../utils/axiosInstance";
import type { ImageListResponse, ImageListParams } from "../types/image";

export const imageService = {
  async getImages(params: ImageListParams) {
    const response = await api.get<ImageListResponse>("/images/list", {
      params,
    });
    return response.data;
  },

  async getImageById(id: number) {
    const response = await api.get<{
      code: number;
      message: string;
      data: any;
    }>(`/images/get/${id}`);
    return response.data;
  },
};

