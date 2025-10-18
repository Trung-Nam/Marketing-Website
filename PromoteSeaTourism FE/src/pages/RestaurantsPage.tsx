import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { restaurantService } from "../services/restaurantService";
import { Restaurant } from "../types/restaurant";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";

const RestaurantsPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const pageSize = 9;

  useEffect(() => {
    loadRestaurants();
  }, [currentPage, searchTerm, priceRange, selectedCategory]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await restaurantService.getRestaurants({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        categoryId:
          selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      });

      setRestaurants(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error("Error loading restaurants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRestaurants();
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

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case "budget":
        return "Dưới 100k";
      case "mid":
        return "100k - 300k";
      case "high":
        return "300k - 500k";
      case "luxury":
        return "Trên 500k";
      default:
        return "Tất cả";
    }
  };

  const getPriceRangeColor = (range: string) => {
    switch (range) {
      case "budget":
        return "bg-green-100 text-green-800";
      case "mid":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "luxury":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-turquoise-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nhà Hàng & Quán Ăn
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Thưởng thức những món ăn ngon nhất, đặc sản biển tươi ngon
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nhà hàng..."
                  className="flex-1 px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
                />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
                >
                  <option value="all">Tất cả giá</option>
                  <option value="budget">Dưới 100k</option>
                  <option value="mid">100k - 300k</option>
                  <option value="high">300k - 500k</option>
                  <option value="luxury">Trên 500k</option>
                </select>
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
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
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
              Hải sản
            </button>
            <button
              onClick={() => setSelectedCategory("2")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "2"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Quán ăn
            </button>
            <button
              onClick={() => setSelectedCategory("3")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "3"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Cafe
            </button>
            <button
              onClick={() => setSelectedCategory("4")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "4"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Bar
            </button>
          </div>
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Không tìm thấy nhà hàng nào
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/restaurants/${restaurant.id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
              >
                {/* Restaurant Image */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={restaurant.thumbnailUrl || "/default-avatar.svg"}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                  {/* Price Range Badge */}
                  <div className="absolute top-4 right-4">
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${getPriceRangeColor(
                        "mid"
                      )}`}
                    >
                      {getPriceRangeLabel("mid")}
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                      {restaurant.category?.name || "Khác"}
                    </span>
                  </div>
                </div>

                {/* Restaurant Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors">
                    {restaurant.name}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {restaurant.summary}
                  </p>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {renderStars(4)} {/* Assuming 4-star rating */}
                    </div>
                    <span className="text-sm text-gray-500">
                      4.2 (89 đánh giá)
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
                    <span>{restaurant.address}</span>
                  </div>

                  {/* Contact Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    {restaurant.phone && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span>{restaurant.phone}</span>
                      </div>
                    )}
                    {restaurant.website && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span>Website</span>
                      </div>
                    )}
                  </div>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      Hải sản tươi
                    </span>
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      Đặc sản địa phương
                    </span>
                    <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                      View biển
                    </span>
                  </div>
                </div>
              </Link>
            ))}
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

export default RestaurantsPage;
