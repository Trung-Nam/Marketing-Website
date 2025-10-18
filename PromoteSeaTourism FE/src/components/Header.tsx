import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

export default function Header() {
  const { user, isAuthenticated, logout, hasRole } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/articles") {
      return (
        location.pathname === path || location.pathname.startsWith("/articles/")
      );
    }
    if (path === "/places") {
      return (
        location.pathname === path || location.pathname.startsWith("/places/")
      );
    }
    if (path === "/events") {
      return (
        location.pathname === path || location.pathname.startsWith("/events/")
      );
    }
    return location.pathname === path;
  };

  // Function to get first letter of name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <button
                onClick={() => navigate("/")}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-turquoise-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M2 12c0-1.5 1-3 2.5-3.5S7 7 7 5.5 6 2 4.5 2 2 3.5 2 5v7c0 1.5 1 3 2.5 3.5S7 17 7 15.5 6 12 4.5 12 2 13.5 2 15v-3zm5 0c0-1.5 1-3 2.5-3.5S12 7 12 5.5 11 2 9.5 2 7 3.5 7 5v7c0 1.5 1 3 2.5 3.5S12 17 12 15.5 11 12 9.5 12 7 13.5 7 15v-3zm5 0c0-1.5 1-3 2.5-3.5S17 7 17 5.5 16 2 14.5 2 12 3.5 12 5v7c0 1.5 1 3 2.5 3.5S17 17 17 15.5 16 12 14.5 12 12 13.5 12 15v-3zm5 0c0-1.5 1-3 2.5-3.5S22 7 22 5.5 21 2 19.5 2 17 3.5 17 5v7c0 1.5 1 3 2.5 3.5S22 17 22 15.5 21 12 19.5 12 17 13.5 17 15v-3z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Biển Ba Động
                </span>
              </button>
            </div>

            {/* Desktop Navigation (route-only) */}
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate("/")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Trang chủ
              </button>
              <button
                onClick={() => navigate("/articles")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/articles")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Bài viết
              </button>
              <button
                onClick={() => navigate("/accommodations")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/accommodations")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Nơi nghỉ
              </button>
              <button
                onClick={() => navigate("/events")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/events")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Sự kiện
              </button>
              <button
                onClick={() => navigate("/places")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/places")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Địa điểm
              </button>
              <button
                onClick={() => navigate("/restaurants")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/restaurants")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Nhà hàng
              </button>
              <button
                onClick={() => navigate("/tours")}
                className={`transition-colors font-medium cursor-pointer ${
                  isActive("/tours")
                    ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                    : "text-gray-700 hover:text-ocean-600"
                }`}
              >
                Tour
              </button>
              {hasRole("Admin") && (
                <button
                  onClick={() => navigate("/admin")}
                  className={`transition-colors font-medium cursor-pointer ${
                    isActive("/admin")
                      ? "text-ocean-600 border-b-2 border-ocean-600 pb-1"
                      : "text-gray-700 hover:text-ocean-600"
                  }`}
                >
                  Dashboard
                </button>
              )}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 font-medium">
                    Xin chào, {user.name}
                  </span>
                  <div className="relative group">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-ocean-600 to-turquoise-600 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                      {user.img ? (
                        <img
                          src={user.img}
                          alt={user.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-white font-bold text-lg">
                          {getInitials(user.name)}
                        </span>
                      )}
                    </div>
                    {/* Dropdown menu */}
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div className="py-1">
                        {user.role === "Admin" && (
                          <>
                            <button className="block w-full text-left px-4 py-2 text-sm text-ocean-600 hover:bg-ocean-50 transition-colors font-medium cursor-pointer">
                              <div className="flex items-center">
                                <svg
                                  className="w-4 h-4 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                                Dashboard
                              </div>
                            </button>
                            <hr className="my-1" />
                          </>
                        )}
                        <button
                          onClick={handleProfileClick}
                          className={`block w-full text-left px-4 py-2 text-sm transition-colors cursor-pointer ${
                            isActive("/profile")
                              ? "text-ocean-600 bg-ocean-50"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          Hồ sơ
                        </button>
                        <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer">
                          Cài đặt
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <button
                    onClick={openLoginModal}
                    className="text-gray-700 hover:text-ocean-600 transition-colors font-medium cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={openRegisterModal}
                    className="bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white px-4 py-2 rounded-lg font-medium hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Đăng ký
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-ocean-600 transition-colors cursor-pointer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation (route-only) */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 rounded-lg mt-2 backdrop-blur-md shadow-lg border border-gray-200/50">
                <button
                  onClick={() => navigate("/")}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Trang chủ
                </button>
                <button
                  onClick={() => {
                    navigate("/articles");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/articles")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Bài viết
                </button>
                <button
                  onClick={() => {
                    navigate("/accommodations");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/accommodations")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Nơi nghỉ
                </button>
                <button
                  onClick={() => {
                    navigate("/events");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/events")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Sự kiện
                </button>
                <button
                  onClick={() => {
                    navigate("/places");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/places")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Địa điểm
                </button>
                <button
                  onClick={() => {
                    navigate("/restaurants");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/restaurants")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Nhà hàng
                </button>
                <button
                  onClick={() => {
                    navigate("/tours");
                    setIsMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                    isActive("/tours")
                      ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                      : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                  }`}
                >
                  Tour
                </button>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {isAuthenticated && user ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3 px-3 py-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-ocean-600 to-turquoise-600 flex items-center justify-center">
                          {user.img ? (
                            <img
                              src={user.img}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {getInitials(user.name)}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-700 font-medium text-sm">
                          Xin chào, {user.name}
                        </span>
                      </div>
                      {user.role === "Admin" && (
                        <>
                          <button className="block w-full text-left px-3 py-2 text-ocean-600 hover:text-ocean-700 transition-colors font-medium cursor-pointer">
                            <div className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                />
                              </svg>
                              Dashboard
                            </div>
                          </button>
                          <hr className="my-1" />
                        </>
                      )}
                      <button
                        onClick={handleProfileClick}
                        className={`block w-full text-left px-3 py-2 transition-colors font-medium cursor-pointer ${
                          isActive("/profile")
                            ? "text-ocean-600 bg-ocean-50 border-l-4 border-ocean-600"
                            : "text-gray-700 hover:text-ocean-600 hover:bg-gray-50"
                        }`}
                      >
                        Hồ sơ
                      </button>
                      <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-ocean-600 transition-colors font-medium cursor-pointer">
                        Cài đặt
                      </button>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 transition-colors font-medium cursor-pointer"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={openLoginModal}
                        className="block w-full text-left px-3 py-2 text-gray-700 hover:text-ocean-600 transition-colors font-medium cursor-pointer"
                      >
                        Đăng nhập
                      </button>
                      <button
                        onClick={openRegisterModal}
                        className="block w-full text-left px-3 py-2 bg-gradient-to-r from-ocean-600 to-turquoise-600 text-white hover:from-ocean-700 hover:to-turquoise-700 transition-all duration-300 rounded-lg font-medium shadow-md cursor-pointer"
                      >
                        Đăng ký
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

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
    </>
  );
}
