import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { placeService } from "../services/placeService";
import { Place } from "../types/place";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";

const PlacesPage: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const pageSize = 9;

  useEffect(() => {
    loadPlaces();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadPlaces = async () => {
    try {
      setLoading(true);
      const response = await placeService.getPlaces({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        categoryId:
          selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      });

      setPlaces(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error("Error loading places:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPlaces();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-turquoise-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Địa Điểm Du Lịch
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Khám phá những địa điểm đẹp nhất, thú vị nhất ven biển
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm địa điểm..."
                  className="flex-1 px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium"
                >
                  Tìm kiếm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "all"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedCategory("1")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "1"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Bãi biển
            </button>
            <button
              onClick={() => setSelectedCategory("2")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "2"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Đảo
            </button>
            <button
              onClick={() => setSelectedCategory("3")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "3"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Vịnh
            </button>
            <button
              onClick={() => setSelectedCategory("4")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "4"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Công viên
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-white rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-ocean-600 text-white"
                  : "text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "map"
                  ? "bg-ocean-600 text-white"
                  : "text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Map
            </button>
          </div>
        </div>

        {/* Places Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Không tìm thấy địa điểm nào
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {places.map((place) => (
              <Link
                key={place.id}
                to={`/places/${place.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Place Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={place.thumbnailUrl || "/default-avatar.svg"}
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                      {place.category?.name || "Khác"}
                    </span>
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4">
                    <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg font-bold flex items-center gap-1">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span>4.5</span>
                    </div>
                  </div>
                </div>

                {/* Place Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors">
                    {place.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {place.summary}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {renderStars(4)} {/* Assuming 4-star rating */}
                    </div>
                    <span className="text-sm text-gray-500">
                      4.5 (128 đánh giá)
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{place.address}</span>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      Miễn phí
                    </span>
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      Chụp ảnh
                    </span>
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      Gia đình
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Map View Placeholder */
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-gray-500 text-lg mb-4">
              🗺️ Chế độ xem bản đồ sẽ được tích hợp sớm
            </div>
            <p className="text-gray-400">
              Hiện tại bạn có thể sử dụng chế độ xem lưới để khám phá các địa
              điểm
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesPage;
