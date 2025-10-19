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
      console.log("Calling API: /favorites/list");
      const response = await api.get("/favorites/list");
      console.log("Raw API response:", response);
      console.log("Response data:", response.data);
      return response.data;
    } catch (error: unknown) {
      console.error("API call failed:", error);
      if (error && typeof error === "object" && "response" in error) {
        console.error(
          "Error details:",
          (error as { response?: { data?: unknown; status?: number } }).response
            ?.data
        );
        console.error(
          "Error status:",
          (error as { response?: { data?: unknown; status?: number } }).response
            ?.status
        );
      }

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
      console.error("Failed to check favorites:", error);
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
