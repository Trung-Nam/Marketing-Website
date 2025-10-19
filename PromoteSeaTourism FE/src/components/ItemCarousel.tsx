import React from "react";
import { Link } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Item {
  id: number;
  title: string;
  summary?: string;
  imageUrl: string;
  type: "article" | "event" | "tour" | "accommodation" | "place" | "restaurant";
  createdAt?: string;
  address?: string;
}

interface ItemCarouselProps {
  items: Item[];
  title: string;
  type: "article" | "event" | "tour" | "accommodation" | "place" | "restaurant";
}

const ItemCarousel: React.FC<ItemCarouselProps> = ({ items, title, type }) => {
  const getDetailUrl = (item: Item) => {
    switch (item.type) {
      case "article":
        return `/articles/${item.id}`;
      case "event":
        return `/events/${item.id}`;
      case "tour":
        return `/tours/${item.id}`;
      case "accommodation":
        return `/accommodations/${item.id}`;
      case "place":
        return `/places/${item.id}`;
      case "restaurant":
        return `/restaurants/${item.id}`;
      default:
        return "#";
    }
  };

  const getTypeLabel = (itemType: string) => {
    switch (itemType) {
      case "article":
        return "Bài viết";
      case "event":
        return "Sự kiện";
      case "tour":
        return "Tour";
      case "accommodation":
        return "Nơi nghỉ";
      case "place":
        return "Địa điểm";
      case "restaurant":
        return "Nhà hàng";
      default:
        return "Khác";
    }
  };

  const getTypeColor = (itemType: string) => {
    switch (itemType) {
      case "article":
        return "bg-blue-500";
      case "event":
        return "bg-green-500";
      case "tour":
        return "bg-purple-500";
      case "accommodation":
        return "bg-orange-500";
      case "place":
        return "bg-teal-500";
      case "restaurant":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Slick carousel settings
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Link
          to={`/${type}s`}
          className="text-ocean-600 hover:text-ocean-700 font-medium transition-colors"
        >
          Xem tất cả →
        </Link>
      </div>

      <div className="carousel-container">
        <Slider {...settings}>
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="px-3">
              <Link
                to={getDetailUrl(item)}
                className="group shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 block border border-gray-200 rounded-xl"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 ${getTypeColor(
                        item.type
                      )} text-white text-sm font-medium rounded-full`}
                    >
                      {getTypeLabel(item.type)}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 bg-white">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-ocean-600 transition-colors line-clamp-2">
                    {item.title}
                  </h3>

                  {item.summary && (
                    <p className="text-gray-600 mb-3 line-clamp-2 text-sm">
                      {item.summary}
                    </p>
                  )}

                  {item.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
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
                      <span className="truncate">{item.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      {item.createdAt &&
                        new Date(item.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                    <div className="flex items-center gap-1 text-ocean-600">
                      <span className="font-medium">Xem chi tiết</span>
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
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default ItemCarousel;
