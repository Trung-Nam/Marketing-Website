import { useState } from "react";
import ImageCarousel from "../components/ImageCarousel";
import VideoSection from "../components/VideoSection";
import LoginModal from "../components/LoginModal";
import RegisterModal from "../components/RegisterModal";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModals = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  // Sample images for carousel
  const carouselImages = [
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Carousel */}
      <section
        id="home"
        className="relative min-h-screen -mt-8 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-turquoise-50"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl floating-animation"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-turquoise-200/30 rounded-full blur-3xl floating-animation [animation-delay:1s]"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-200/20 rounded-full blur-3xl floating-animation [animation-delay:2s]"></div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left fade-in">
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wider shadow-lg">
                  Khám phá thiên đường biển
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-6 leading-tight">
                <span className="block uppercase tracking-wider">Biển</span>
                <span className="block uppercase tracking-wider bg-gradient-to-r from-ocean-600 via-turquoise-600 to-primary-600 bg-clip-text text-transparent">
                  Ba Động
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Khám phá vẻ đẹp hoang sơ và bí ẩn của biển Ba Động - điểm đến du
                lịch lý tưởng với bãi cát trắng mịn, nước biển trong xanh và
                cảnh quan thiên nhiên tuyệt đẹp.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <button
                  onClick={openRegisterModal}
                  className="group bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-ocean-700 hover:to-turquoise-700 focus:outline-none focus:ring-4 focus:ring-ocean-300 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl cursor-pointer"
                >
                  <span className="flex items-center space-x-2">
                    <span>KHÁM PHÁ NGAY</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </span>
                </button>
                <button className="group bg-gradient-to-r from-white/90 to-blue-50/90 backdrop-blur-sm text-ocean-600 border-2 border-ocean-600 px-10 py-4 rounded-2xl font-bold text-lg hover:from-ocean-600 hover:to-turquoise-600 hover:text-white focus:outline-none focus:ring-4 focus:ring-ocean-300 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
                  <span className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span>XEM VIDEO</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Right Carousel */}
            <div className="fade-in">
              <ImageCarousel images={carouselImages} />
            </div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 wave-animation">
          <svg
            className="w-8 h-8 text-ocean-600/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Video Section */}
      <VideoSection />

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-white to-blue-50"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tại sao chọn Ba Động?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Ba Động mang đến trải nghiệm du lịch biển độc đáo với những đặc
              điểm riêng biệt
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-effect rounded-2xl p-8 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-turquoise-500 rounded-full flex items-center justify-center mb-6">
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Vẻ đẹp hoang sơ
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Ba Động vẫn giữ được vẻ đẹp nguyên sơ với bãi cát trắng mịn,
                nước biển trong vắt và hệ sinh thái biển phong phú.
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-8 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-turquoise-500 to-secondary-500 rounded-full flex items-center justify-center mb-6">
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
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Khí hậu lý tưởng
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Khí hậu nhiệt đới ẩm ướt với nhiệt độ trung bình 26-28°C, thích
                hợp cho du lịch quanh năm.
              </p>
            </div>

            <div className="glass-effect rounded-2xl p-8 card-hover">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center mb-6">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Dễ dàng tiếp cận
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Vị trí thuận lợi với hệ thống giao thông phát triển, dễ dàng di
                chuyển từ các thành phố lớn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section id="activities" className="py-20 tropical-gradient">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
              Hoạt động thú vị
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Khám phá những trải nghiệm độc đáo tại Ba Động
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-effect-dark rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Lặn biển
              </h3>
              <p className="text-white/80 text-sm">
                Khám phá thế giới dưới đáy biển
              </p>
            </div>

            <div className="glass-effect-dark rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Chèo thuyền
              </h3>
              <p className="text-white/80 text-sm">
                Trải nghiệm cảm giác lướt sóng
              </p>
            </div>

            <div className="glass-effect-dark rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Câu cá</h3>
              <p className="text-white/80 text-sm">
                Thư giãn với hoạt động câu cá
              </p>
            </div>

            <div className="glass-effect-dark rounded-2xl p-6 card-hover">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-white"
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
              <h3 className="text-lg font-semibold text-white mb-2">
                Tắm biển
              </h3>
              <p className="text-white/80 text-sm">
                Thư giãn trên bãi cát trắng
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section
        id="gallery"
        className="py-20 bg-gradient-to-b from-blue-50 to-white"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Thư viện ảnh
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Khám phá vẻ đẹp tuyệt vời của biển Ba Động qua những hình ảnh chân
              thực
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {carouselImages.slice(0, 6).map((image, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl shadow-lg card-hover"
              >
                <img
                  src={image}
                  alt={`Biển Ba Động ${index + 1}`}
                  className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-lg font-semibold">
                    Hình ảnh {index + 1}
                  </h3>
                  <p className="text-sm text-white/80">
                    Vẻ đẹp hoang sơ của biển Ba Động
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer">
              Xem thêm ảnh
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 ocean-gradient">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
            Sẵn sàng khám phá Ba Động?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Đăng ký ngay để nhận thông tin mới nhất về các tour du lịch và ưu
            đãi đặc biệt
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={openRegisterModal}
              className="bg-gradient-to-r from-white to-blue-50 text-ocean-600 px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-50 hover:to-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-white/20 cursor-pointer"
            >
              Đăng ký ngay
            </button>
            <button
              onClick={openLoginModal}
              className="bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-white/30 hover:to-white/20 transition-all duration-300 transform hover:scale-105 border border-white/30 shadow-lg hover:shadow-xl cursor-pointer"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Biển Ba Động</h3>
            <p className="text-gray-400 mb-6">
              Khám phá vẻ đẹp hoang sơ của biển Ba Động - điểm đến du lịch lý
              tưởng
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                </svg>
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400">
                &copy; 2024 Biển Ba Động. Tất cả quyền được bảo lưu.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeModals}
        onSwitchToRegister={openRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={closeModals}
        onSwitchToLogin={openLoginModal}
      />
    </div>
  );
}
