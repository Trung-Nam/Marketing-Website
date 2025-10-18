import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { eventService } from "../services/eventService";
import { Event } from "../types/event";
import LoadingSpinner from "../components/LoadingSpinner";
import Pagination from "../components/Pagination";

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "timeline">("grid");

  const pageSize = 9;

  useEffect(() => {
    loadEvents();
  }, [currentPage, searchTerm, selectedCategory]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        page: currentPage,
        pageSize,
        search: searchTerm || undefined,
        categoryId:
          selectedCategory !== "all" ? parseInt(selectedCategory) : undefined,
      });

      setEvents(response.data);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadEvents();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUpcoming = (startTime: string) => {
    return new Date(startTime) > new Date();
  };

  const getEventStatus = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "ended";
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
            <button
              onClick={() => setSelectedCategory("1")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "1"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Lễ hội
            </button>
            <button
              onClick={() => setSelectedCategory("2")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "2"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Thể thao
            </button>
            <button
              onClick={() => setSelectedCategory("3")}
              className={`px-6 py-3 rounded-full transition-colors ${
                selectedCategory === "3"
                  ? "bg-ocean-600 text-white"
                  : "bg-white text-gray-700 hover:bg-ocean-50"
              }`}
            >
              Văn hóa
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
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">
              Không tìm thấy sự kiện nào
            </div>
          </div>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event) => {
              const status = getEventStatus(event.startTime, event.endTime);
              return (
                <Link
                  key={event.id}
                  to={`/events/${event.id}`}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                >
                  {/* Event Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.thumbnailUrl || "/default-avatar.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                          status
                        )}`}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                        {event.category?.name || "Khác"}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-ocean-600 transition-colors">
                      {event.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {event.summary}
                    </p>

                    {/* Event Date & Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
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
                      <span>{formatDate(event.startTime)}</span>
                      <span>•</span>
                      <span>{formatTime(event.startTime)}</span>
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
                      <span>{event.address}</span>
                    </div>

                    {/* Price */}
                    {event.priceInfo && (
                      <div className="text-lg font-bold text-ocean-600">
                        {event.priceInfo}
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Timeline View */
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {events.map((event, index) => {
                const status = getEventStatus(event.startTime, event.endTime);
                return (
                  <div key={event.id} className="relative">
                    {/* Timeline Line */}
                    {index < events.length - 1 && (
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
                            <p className="text-gray-600 mb-4">
                              {event.summary}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                              status
                            )}`}
                          >
                            {getStatusText(status)}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
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
                            <span>{formatDate(event.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2">
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
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
