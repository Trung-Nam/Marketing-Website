import api from "../utils/axiosInstance";
import type { FavoritesListResponse } from "../types/favorite";

// Helper function to convert targetType number to string
const getTargetTypeString = (targetType: number): string => {
  const typeMap: Record<number, string> = {
    0: "Category",
    1: "Article",
    2: "Event",
    3: "Restaurant",
    4: "Accommodation",
    5: "Place",
    6: "Tour",
  };
  return typeMap[targetType] || "Unknown";
};

class FavoriteService {
  async getFavorites(): Promise<FavoritesListResponse> {
    try {
      const response = await api.get("/favorites/list");
      return response.data;
    } catch (error: unknown) {
      // Return empty response structure for now
      return {
        code: 200,
        message: "Success",
        data: [],
      };
    }
  }

  async addFavorite(targetType: number, targetId: number): Promise<unknown> {
    const targetTypeString = getTargetTypeString(targetType);
    const response = await api.post("/favorites/create", {
      targetType: targetTypeString,
      targetId,
    });
    return response.data;
  }

  async removeFavorite(targetType: number, targetId: number): Promise<unknown> {
    const targetTypeString = getTargetTypeString(targetType);
    const response = await api.delete("/favorites/delete", {
      params: {
        targetType: targetTypeString,
        targetId,
      },
    });
    return response.data;
  }

  async checkFavorite(
    targetType: number,
    targetId: number
  ): Promise<{ isFavorited: boolean }> {
    try {
      const targetTypeString = getTargetTypeString(targetType);
      const response = await api.get("/favorites/check", {
        params: {
          targetType: targetTypeString,
          targetId,
        },
      });

      // Parse the response correctly - API returns { code: 200, message: "Success", data: { isFavorite: true } }
      const isFavorited = response.data?.data?.isFavorite || false;

      return { isFavorited };
    } catch (error) {
      return { isFavorited: false };
    }
  }

  async toggleFavorite(targetType: number, targetId: number): Promise<unknown> {
    const targetTypeString = getTargetTypeString(targetType);
    const response = await api.post("/favorites/toggle", {
      targetType: targetTypeString,
      targetId,
    });
    return response.data;
  }
}

export const favoriteService = new FavoriteService();
