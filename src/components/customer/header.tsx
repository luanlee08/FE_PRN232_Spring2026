"use client";

import { Search, ShoppingCart, Heart, Menu, X, Bell, User, ChevronDown, ClipboardList, MapPin, Ticket, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { CustomerNotificationService } from "@/services/customer_services/customer.notification.service";
import { API_BASE } from "@/configs/api-configs";

export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserMenuEnter = () => {
    if (userMenuTimer.current) clearTimeout(userMenuTimer.current);
    setOpenUserMenu(true);
  };
  const handleUserMenuLeave = () => {
    userMenuTimer.current = setTimeout(() => setOpenUserMenu(false), 200);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const res = await CustomerNotificationService.getUnreadCount();
        if (res.status === 200 && res.data !== null) {
          setUnreadCount(res.data);
        }
      } catch {
      }
    };
    fetchUnread();
  }, [isAuthenticated]);

  // Click-outside still closes menu if opened via other means
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công");
    router.push("/login");
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    // If it's a data URL (base64) or full URL, return as-is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, prepend API_BASE for local backend images
    return `${API_BASE}${imageUrl}`;
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

            <Link href="/notification" className="relative hover:opacity-80">
              <Bell size={20} className="cursor-pointer" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold text-[#FF6B35]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            </Link>

            <Link href="/cart" className="relative hover:opacity-80">
              <ShoppingCart size={20} className="cursor-pointer" />
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-white text-xs font-bold text-[#FF6B35]">
                0
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-3 ml-2">
              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={userMenuRef}
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2 hover:opacity-80 transition"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 flex items-center justify-center">
                      {user?.image && getImageUrl(user.image) ? (
                        <img
                          src={getImageUrl(user.image) || ''}
                          alt={user.accountName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <span className="text-sm font-medium">{user?.accountName}</span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform ${openUserMenu ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* bridge gap so mouse doesn't lose hover when moving to dropdown */}
                  {openUserMenu && <div className="absolute right-0 top-full w-full h-2" onMouseEnter={handleUserMenuEnter} />}

                  {openUserMenu && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100"
                      onMouseEnter={handleUserMenuEnter}
                      onMouseLeave={handleUserMenuLeave}
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-semibold text-gray-800">{user?.accountName}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{user?.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setOpenUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                      >
                        <User size={17} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        Tài Khoản Của Tôi
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setOpenUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                      >
                        <ClipboardList size={17} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        Đơn Mua
                      </Link>

                      <Link
                        href="/profile/addresses"
                        onClick={() => setOpenUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                      >
                        <MapPin size={17} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        Địa Chỉ Của Tôi
                      </Link>

                      <Link
                        href="/vouchers"
                        onClick={() => setOpenUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                      >
                        <Ticket size={17} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
                        Quản Lý Voucher
                      </Link>

                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => { setOpenUserMenu(false); handleLogout(); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors group"
                        >
                          <LogOut size={17} className="text-red-400 group-hover:text-red-500 transition-colors" />
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FF6B35]/20 flex items-center justify-center">
                        {user?.image && getImageUrl(user.image) ? (
                          <img
                            src={getImageUrl(user.image) || ''}
                            alt={user.accountName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User size={20} className="text-[#FF6B35]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{user?.accountName}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 text-[#FF6B35] font-medium mb-2"
                    >
                      <User size={17} />
                      Tài Khoản Của Tôi
                    </Link>
                    <Link
                      href="/notification"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 text-gray-700 font-medium mb-2"
                    >
                      <Bell size={17} />
                      Thông Báo
                      {unreadCount > 0 && (
                        <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF6B35] px-1 text-[10px] font-bold text-white">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 text-gray-700 font-medium mb-2"
                    >
                      <ClipboardList size={17} />
                      Đơn Mua
                    </Link>
                    <Link
                      href="/profile/addresses"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 text-gray-700 font-medium mb-2"
                    >
                      <MapPin size={17} />
                      Địa Chỉ Của Tôi
                    </Link>
                    <Link
                      href="/vouchers"
                      onClick={() => setOpenMenu(false)}
                      className="flex items-center gap-2 text-gray-700 font-medium mb-3"
                    >
                      <Ticket size={17} />
                      Quản Lý Voucher
                    </Link>
                    <button
                      onClick={() => { setOpenMenu(false); handleLogout(); }}
                      className="flex items-center gap-2 text-red-500 font-medium"
                    >
                      <LogOut size={17} />
                      Đăng Xuất
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
