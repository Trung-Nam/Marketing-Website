import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Avatar from "./Avatar";
import { useAuthStore } from "../store/useAuthStore";

export default function Navbar() {
  const { isAuthenticated, user, logout, hasRole } = useAuthStore();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="font-semibold text-primary-700">
          PromoteSea
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className="hover:text-primary-600">
            Trang chủ
          </Link>
          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center gap-2"
                onClick={() => setOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={open}
                type="button"
              >
                <Avatar src={user?.img} alt={user?.name ?? "User"} />
                <span className="hidden sm:inline text-gray-700">
                  {user?.name}
                </span>
              </button>
              {open && (
                <div
                  className="absolute right-0 mt-2 w-44 rounded-xl border bg-white p-2 shadow-lg z-50 pointer-events-auto"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Link
                    to="/profile"
                    className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => setOpen(false)}
                  >
                    Hồ sơ
                  </Link>
                  {hasRole("Admin") && (
                    <button
                      type="button"
                      className="w-full text-left rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpen(false);
                        navigate("/admin");
                      }}
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      logout();
                    }}
                    className="w-full text-left rounded-lg px-3 py-2 text-sm text-secondary-600 hover:bg-gray-50"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-600">
                Đăng nhập
              </Link>
              <Link to="/register" className="hover:text-primary-600">
                Đăng ký
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
