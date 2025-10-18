import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { accommodationService } from "../services/accommodationService";
import { Accommodation } from "../types/accommodation";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import ImageCarousel from "../components/ImageCarousel";

const AccommodationsPage: React.FC = () => {
  const [allAccommodations, setAllAccommodations] = useState<Accommodation[]>(
    []
  );
  const [filteredAccommodations, setFilteredAccommodations] = useState<
    Accommodation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const pageSize = 9;

  useEffect(() => {
    loadAccommodations();
  }, []);

  useEffect(() => {
    filterAccommodations();
  }, [allAccommodations, searchTerm, priceRange, selectedCategory]);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const response = await accommodationService.getAccommodations({
        page: 1,
        pageSize: 1000, // Load all accommodations
      });

      setAllAccommodations(response.data);
    } catch (error) {
      console.error("Error loading accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAccommodations = () => {
    let filtered = allAccommodations;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (accommodation) =>
          accommodation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          accommodation.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    if (priceRange !== "all") {
      filtered = filtered.filter((accommodation) => {
        const price = accommodation.priceFrom || 0;
        switch (priceRange) {
          case "budget":
            return price < 500000;
          case "mid":
            return price >= 500000 && price < 1000000;
          case "high":
            return price >= 1000000 && price < 2000000;
          case "luxury":
            return price >= 2000000;
          default:
            return true;
        }
      });
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (accommodation) =>
          accommodation.categoryId === parseInt(selectedCategory)
      );
    }

    setFilteredAccommodations(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setTotalItems(filtered.length);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    filterAccommodations();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getPriceRange = (price: number) => {
    if (price < 500000) return "budget";
    if (price < 1000000) return "mid";
    if (price < 2000000) return "high";
    return "luxury";
  };

  const getPriceRangeLabel = (range: string) => {
    switch (range) {
      case "budget":
        return "Dưới 500k";
      case "mid":
        return "500k - 1M";
      case "high":
        return "1M - 2M";
      case "luxury":
        return "Trên 2M";
      default:
        return "Tất cả";
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-turquoise-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Nơi Nghỉ Dưỡng Tuyệt Vời
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Khám phá những khách sạn, resort và homestay đẹp nhất ven biển
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm nơi nghỉ..."
                  className="flex-1 px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
                />
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-6 py-4 rounded-lg bg-white/90 backdrop-blur-sm border border-white/30 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white focus:bg-white shadow-lg"
                >
                  <option value="all">Tất cả giá</option>
                  <option value="budget">Dưới 500k</option>
                  <option value="mid">500k - 1M</option>
                  <option value="high">1M - 2M</option>
                  <option value="luxury">Trên 2M</option>
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
              Khách sạn
            </button>
            <button
              onClick={() => setSelectedCategory("2")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "2"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Resort
            </button>
            <button
              onClick={() => setSelectedCategory("3")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "3"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Homestay
            </button>
          </div>
        </div>

        {/* Accommodations Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredAccommodations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Không tìm thấy nơi nghỉ nào
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAccommodations
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((accommodation) => (
                <Link
                  key={accommodation.id}
                  to={`/accommodations/${accommodation.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Accommodation Images */}
                  <div className="relative h-64 overflow-hidden">
                    {accommodation.images && accommodation.images.length > 0 ? (
                      <ImageCarousel
                        images={accommodation.images}
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        src={
                          accommodation.thumbnailUrl || "/default-avatar.svg"
                        }
                        alt={accommodation.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Price Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg font-bold">
                        {formatPrice(accommodation.priceFrom)}
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                        {accommodation.category?.name || "Khác"}
                      </span>
                    </div>
                  </div>

                  {/* Accommodation Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors">
                      {accommodation.name}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {accommodation.summary}
                    </p>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex">
                        {renderStars(4)} {/* Assuming 4-star rating */}
                      </div>
                      <span className="text-sm text-gray-500">
                        4.0 (128 đánh giá)
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
                      <span>{accommodation.address}</span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                        WiFi miễn phí
                      </span>
                      <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                        Bể bơi
                      </span>
                      <span className="px-2 py-1 bg-ocean-50 text-ocean-600 text-xs rounded-full">
                        Spa
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

export default AccommodationsPage;
