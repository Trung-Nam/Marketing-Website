import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { categoryService } from "../services/categoryService";
import type { Event } from "../types/event";
import type { Category } from "../types/category";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";
import { getEventCoverImageUrl } from "../utils/eventUtils";

const EventsPage: React.FC = () => {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  const pageSize = 9;

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [allEvents, searchTerm, selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        page: 1,
        pageSize: 1000, // Load all events
      });

      setAllEvents(response.data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({
        page: 1,
        pageSize: 100,
      });
      console.log("Categories loaded:", response.data);
      setCategories(response.data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  };

  const getCategoryName = (event: Event): string => {
    return event.category?.name || "Khác";
  };

  const getAvailableCategories = (): Category[] => {
    // Get unique category IDs from events
    const usedCategoryIds = [
      ...new Set(
        allEvents.map((event) => event.category?.id || event.categoryId)
      ),
    ];

    console.log("Available category IDs from events:", usedCategoryIds);
    console.log("All categories:", categories);

    // Return only categories that have events
    return categories.filter((category) =>
      usedCategoryIds.includes(category.id)
    );
  };

  const filterEvents = () => {
    let filtered = allEvents;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.summary.toLowerCase().includes(term) ||
          event.address.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      console.log("Filtering by category:", selectedCategory);
      filtered = filtered.filter(
        (event) =>
          (event.category?.id || event.categoryId) ===
          parseInt(selectedCategory)
      );
      console.log("Filtered events count:", filtered.length);
    }

    setFilteredEvents(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    filterEvents();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
      return "upcoming";
    } else if (now >= start && now <= end) {
      return "ongoing";
    } else {
      return "ended";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "ended":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "upcoming":
        return "Sắp diễn ra";
      case "ongoing":
        return "Đang diễn ra";
      case "ended":
        return "Đã kết thúc";
      default:
        return "Không xác định";
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
              Sự Kiện & Hoạt Động
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Tham gia những sự kiện thú vị và hoạt động đặc biệt tại biển
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm sự kiện..."
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
            {getAvailableCategories().map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id.toString())}
                className={`px-6 py-3 rounded-full transition-colors ${
                  selectedCategory === category.id.toString()
                    ? "bg-ocean-600 text-white"
                    : "bg-white text-gray-700 hover:bg-ocean-50"
                }`}
              >
                {category.name}
              </button>
            ))}
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
              onClick={() => setViewMode("timeline")}
              className={`px-4 py-2 rounded-md transition-colors ${
                viewMode === "timeline"
                  ? "bg-ocean-600 text-white"
                  : "text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>

        {/* Events Content */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Không tìm thấy sự kiện nào
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((event) => {
                const status = getEventStatus(event.startTime, event.endTime);
                return (
                  <Link
                    key={event.id}
                    to={`/events/${event.id}`}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                  >
                    {/* Event Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={getEventCoverImageUrl(event)}
                        alt={event.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                      {/* Status Badge */}
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            status
                          )}`}
                        >
                          {getStatusText(status)}
                        </span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                          {getCategoryName(event)}
                        </span>
                      </div>

                      {/* Date Badge */}
                      <div className="absolute bottom-4 left-4">
                        <span className="px-3 py-1 bg-ocean-600/90 text-white text-sm font-medium rounded-full">
                          {new Date(event.startTime).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Event Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors">
                        {event.title}
                      </h3>

                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {event.summary}
                      </p>

                      {/* Time & Location */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>
                            {new Date(event.startTime).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate">{event.address}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        ) : (
          /* Timeline View */
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {filteredEvents.map((event, index) => {
                const status = getEventStatus(event.startTime, event.endTime);
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline Line */}
                    {index < filteredEvents.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-300"></div>
                    )}

                    <div className="flex gap-6">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0">
                        <div
                          className={`w-16 h-16 rounded-full flex items-center justify-center ${
                            status === "ongoing"
                              ? "bg-green-500"
                              : status === "upcoming"
                              ? "bg-blue-500"
                              : "bg-gray-400"
                          }`}
                        >
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Event Content */}
                      <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                            <p className="text-gray-600 mb-3">
                              {event.summary}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {new Date(event.startTime).toLocaleDateString(
                                "vi-VN"
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              {new Date(event.startTime).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}{" "}
                              -{" "}
                              {new Date(event.endTime).toLocaleTimeString(
                                "vi-VN",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
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
                            <span>{event.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              total={filteredEvents.length}
              pageSize={pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Results Summary */}
        {!loading && filteredEvents.length > 0 && (
          <div className="text-center text-gray-600 mt-4">
            Hiển thị{" "}
            {Math.min((currentPage - 1) * pageSize + 1, filteredEvents.length)}{" "}
            - {Math.min(currentPage * pageSize, filteredEvents.length)} trong
            tổng số {filteredEvents.length} sự kiện
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
