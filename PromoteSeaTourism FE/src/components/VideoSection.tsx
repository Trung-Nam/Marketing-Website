import { useState } from "react";

interface VideoSectionProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export default function VideoSection({
  videoUrl = "https://www.youtube.com/embed/ag48Rl400pQ?controls=0&rel=0&playsinline=1&enablejsapi=1&origin=https%3A%2F%2Ftopasecolodge.com&widgetid=1&forigin=https%3A%2F%2Ftopasecolodge.com%2F&aoriginsup=1&vf=2", // Placeholder video
  thumbnailUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  title = "Khám phá vẻ đẹp biển Ba Động",
  description = "Xem video để trải nghiệm vẻ đẹp hoang sơ và tuyệt vời của biển Ba Động",
}: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
  };

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Video giới thiệu
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {description}
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Video Thumbnail */}
          {!isPlaying && (
            <div className="relative group cursor-pointer" onClick={handlePlay}>
              <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300" />

                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl group-hover:bg-white group-hover:scale-110 transition-all duration-300">
                    <svg
                      className="w-8 h-8 text-ocean-600 ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Video Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-white/90 text-lg">Nhấn để xem video</p>
                </div>
              </div>
            </div>
          )}

          {/* Video Player */}
          {isPlaying && (
            <div className="relative w-full h-64 md:h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={videoUrl}
                title={title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                aria-label="Close video"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Video Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-turquoise-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chất lượng HD
            </h3>
            <p className="text-gray-600">
              Video được quay với chất lượng cao, mang đến trải nghiệm chân thực
              nhất
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Thời lượng phù hợp
            </h3>
            <p className="text-gray-600">
              Video ngắn gọn, súc tích nhưng vẫn truyền tải đầy đủ thông tin
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
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
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nội dung hấp dẫn
            </h3>
            <p className="text-gray-600">
              Khám phá những góc nhìn độc đáo và tuyệt đẹp của biển Ba Động
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
