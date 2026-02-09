"use client";

import { Search, ShoppingCart, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/auth-context";

export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công");
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FF6B35] text-white shadow-md">
      {/* ================= TOP BAR ================= */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">

          {/* ===== LEFT ===== */}
          <div className="flex items-center gap-3">
            {/* Mobile menu */}
            <button
              className="lg:hidden"
              onClick={() => setOpenMenu(true)}
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white">
                <span className="text-lg font-bold text-[#FF6B35]">👑</span>
              </div>
              <span className="text-lg font-bold tracking-wide">
                LorKingdom
              </span>
            </Link>
          </div>

          {/* ===== CENTER (SEARCH DESKTOP) ===== */}
          <div className="hidden lg:flex flex-1 justify-center px-6">
            <div className="flex w-full max-w-xl items-center rounded-full bg-white px-4 py-2">
              <input
                placeholder="Tìm kiếm đồ chơi..."
                className="flex-1 text-sm text-gray-800 outline-none"
              />
              <Search size={18} className="text-[#FF6B35]" />
            </div>
          </div>

          {/* ===== RIGHT ===== */}
          <div className="flex items-center gap-4">
            <button className="hover:opacity-80">
              <Heart size={20} />
            </button>

            <div className="relative">
              <ShoppingCart size={20} className="cursor-pointer hover:opacity-80" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold text-[#FF6B35]">
                0
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-3 ml-2">
              {isAuthenticated ? (
                <>
                  <span className="text-sm">
                    Xin chào,{' '}
                    <span className="font-semibold">{user?.accountName}</span>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium hover:opacity-80 transition"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:opacity-80 transition"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium hover:opacity-80 transition"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SEARCH MOBILE ================= */}
      <div className="lg:hidden px-4 pb-3">
        <div className="flex items-center rounded-full bg-white px-4 py-2">
          <input
            placeholder="Tìm kiếm đồ chơi..."
            className="flex-1 text-sm text-gray-800 outline-none"
          />
          <Search size={18} className="text-[#FF6B35]" />
        </div>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {openMenu && (
        <div className="fixed inset-0 z-50 bg-black/40">
          <div className="absolute left-0 top-0 h-full w-64 bg-white p-4 text-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-lg font-bold">Menu</span>
              <button onClick={() => setOpenMenu(false)}>
                <X />
              </button>
            </div>

            <nav className="flex flex-col gap-4 text-sm font-medium">
              <Link href="/" onClick={() => setOpenMenu(false)}>Trang chủ</Link>
              <Link href="/products" onClick={() => setOpenMenu(false)}>Sản phẩm</Link>
              <Link href="/blog" onClick={() => setOpenMenu(false)}>Blog</Link>
              <Link href="/promotions" onClick={() => setOpenMenu(false)}>Khuyến mãi</Link>
              
              <div className="border-t pt-4 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="text-gray-600 mb-2">
                      Xin chào, <span className="font-semibold text-[#FF6B35]">{user?.accountName}</span>
                    </div>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        handleLogout();
                      }}
                      className="text-red-500 font-medium"
                    >
                      Đăng xuất
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setOpenMenu(false)}
                      className="block text-[#FF6B35] font-medium mb-2"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpenMenu(false)}
                      className="block text-[#FF6B35] font-medium"
                    >
                      Đăng ký
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
