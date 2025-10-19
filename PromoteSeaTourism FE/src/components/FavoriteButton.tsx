import React, { useState, useEffect } from "react";
import { favoriteService } from "../services/favoriteService";
import { useAuthStore } from "../store/useAuthStore";

interface FavoriteButtonProps {
  targetType: number;
  targetId: number;
  isFavorited?: boolean;
  onToggle?: (isFavorited: boolean) => void;
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  targetType,
  targetId,
  isFavorited: initialIsFavorited,
  onToggle,
  className = "",
}) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Check favorite status on mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!isAuthenticated) {
        setIsFavorited(false);
        setIsChecking(false);
        return;
      }

      try {
        const response = await favoriteService.checkFavorite(
          targetType,
          targetId
        );

        // Parse the response - should be { isFavorited: boolean }
        const isFavorited = response.isFavorited || false;
        setIsFavorited(isFavorited);
      } catch (error) {
        console.error("Error checking favorite status:", error);
        setIsFavorited(initialIsFavorited || false);
      } finally {
        setIsChecking(false);
      }
    };

    checkFavoriteStatus();
  }, [targetType, targetId, isAuthenticated, initialIsFavorited]);

  const handleToggleFavorite = async () => {
    if (isLoading || !isAuthenticated) return;

    try {
      setIsLoading(true);

      if (isFavorited) {
        await favoriteService.removeFavorite(targetType, targetId);
        setIsFavorited(false);
        onToggle?.(false);
      } else {
        await favoriteService.addFavorite(targetType, targetId);
        setIsFavorited(true);
        onToggle?.(true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking favorite status
  if (isChecking) {
    return (
      <button
        disabled
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium opacity-50 cursor-not-allowed ${className}`}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        Đang kiểm tra...
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || !isAuthenticated}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 ${
        isFavorited
          ? "bg-red-500 text-white hover:bg-red-600"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
      } ${
        isLoading || !isAuthenticated ? "opacity-50 cursor-not-allowed" : ""
      } ${className}`}
    >
      <svg
        className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`}
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {isLoading ? "Đang xử lý..." : isFavorited ? "Đã yêu thích" : "Yêu thích"}
    </button>
  );
};

export default FavoriteButton;
