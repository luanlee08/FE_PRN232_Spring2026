"use client";

import {
  Search,
  ShoppingCart,
  Heart,
  Menu,
  X,
  Bell,
  User,
  ChevronDown,
  ClipboardList,
  MapPin,
  Ticket,
  Wallet,
  LogOut,
} from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { CustomerNotificationService } from "@/services/customer_services/customer.notification.service";
import { CustomerProductService } from "@/services/customer_services/customer.product.service";
import { API_BASE } from "@/configs/api-configs";

export function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState("");
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlKeyword = searchParams.get("keyword") ?? "";

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
        // ignore
      }
    };

    fetchUnread();
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setOpenUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSearchKeyword(urlKeyword);
  }, [urlKeyword]);

  const handleLogout = async () => {
    await logout();
    toast.success("Đăng xuất thành công");
    router.push("/login");
  };

  const getImageUrl = (imageUrl: string | null | undefined) => {
    if (!imageUrl) return null;
    if (imageUrl.startsWith("data:") || imageUrl.startsWith("http")) return imageUrl;
    return `${API_BASE}${imageUrl}`;
  };

  const handleSearch = async () => {
    const keyword = searchKeyword.trim();
    const query = keyword ? `/?keyword=${encodeURIComponent(keyword)}` : "/";

    try {
      await CustomerProductService.getProducts({
        page: 1,
        pageSize: 8,
        keyword: keyword || undefined,
      });
      setOpenMenu(false);
      router.push(query);
    } catch {
      toast.error("Không thể tìm kiếm sản phẩm lúc này");
    }
  };

  const handleSearchKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    await handleSearch();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FF6B35] text-white shadow-md">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpenMenu(true)}>
              <Menu size={22} />
            </button>

            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-white">
                <span className="text-lg font-bold text-[#FF6B35]">👑</span>
              </div>
              <span className="text-lg font-bold tracking-wide">LorKingdom</span>
            </Link>
          </div>

          <div className="hidden lg:flex flex-1 justify-center px-6">
            <div className="flex w-full max-w-xl items-center rounded-full bg-white px-4 py-2">
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Tìm kiếm đồ chơi..."
                className="flex-1 text-sm text-gray-800 outline-none"
              />
              <button type="button" onClick={handleSearch} aria-label="Search products">
                <Search size={18} className="text-[#FF6B35]" />
              </button>
            </div>
          </div>

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

            <div className="ml-2 hidden items-center gap-3 lg:flex">
              {isAuthenticated ? (
                <div
                  className="relative"
                  ref={userMenuRef}
                  onMouseEnter={handleUserMenuEnter}
                  onMouseLeave={handleUserMenuLeave}
                >
                  <button
                    onClick={() => router.push("/profile")}
                    className="flex items-center gap-2 transition hover:opacity-80"
                  >
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white/20">
                      {user?.image && getImageUrl(user.image) ? (
                        <img
                          src={getImageUrl(user.image) || ""}
                          alt={user.accountName}
                          className="h-full w-full object-cover"
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

                  {openUserMenu && (
                    <div
                      className="absolute right-0 top-full h-2 w-full"
                      onMouseEnter={handleUserMenuEnter}
                    />
                  )}

                  {openUserMenu && (
                    <div
                      className="absolute right-0 z-50 mt-2 w-64 rounded-xl border border-gray-100 bg-white py-2 shadow-2xl"
                      onMouseEnter={handleUserMenuEnter}
                      onMouseLeave={handleUserMenuLeave}
                    >
                      <div className="mb-1 border-b border-gray-100 px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{user?.accountName}</p>
                        <p className="mt-0.5 truncate text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setOpenUserMenu(false)}
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        <User
                          size={17}
                          className="text-gray-400 transition-colors group-hover:text-orange-500"
                        />
                        Tài Khoản Của Tôi
                      </Link>
                      <Link
                        href="/profile?tab=orders"
                        onClick={() => setOpenUserMenu(false)}
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        <ClipboardList
                          size={17}
                          className="text-gray-400 transition-colors group-hover:text-orange-500"
                        />
                        Đơn Mua
                      </Link>
                      <Link
                        href="/profile?tab=addresses"
                        onClick={() => setOpenUserMenu(false)}
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        <MapPin
                          size={17}
                          className="text-gray-400 transition-colors group-hover:text-orange-500"
                        />
                        Địa Chỉ Của Tôi
                      </Link>
                      <Link
                        href="/profile?tab=vouchers"
                        onClick={() => setOpenUserMenu(false)}
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Ticket
                          size={17}
                          className="text-gray-400 transition-colors group-hover:text-orange-500"
                        />
                        Quản Lý Voucher
                      </Link>
                      <Link
                        href="/profile/wallet"
                        onClick={() => setOpenUserMenu(false)}
                        className="group flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Wallet
                          size={17}
                          className="text-gray-400 transition-colors group-hover:text-orange-500"
                        />
                        Ví Của Tôi
                      </Link>

                      <div className="mt-1 border-t border-gray-100 pt-1">
                        <button
                          onClick={() => {
                            setOpenUserMenu(false);
                            handleLogout();
                          }}
                          className="group flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-50"
                        >
                          <LogOut
                            size={17}
                            className="text-red-400 transition-colors group-hover:text-red-500"
                          />
                          Đăng Xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium transition hover:opacity-80">
                    Đăng nhập
                  </Link>
                  <Link href="/register" className="text-sm font-medium transition hover:opacity-80">
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 pb-3 lg:hidden">
        <div className="flex items-center rounded-full bg-white px-4 py-2">
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Tìm kiếm đồ chơi..."
            className="flex-1 text-sm text-gray-800 outline-none"
          />
          <button type="button" onClick={handleSearch} aria-label="Search products">
            <Search size={18} className="text-[#FF6B35]" />
          </button>
        </div>
      </div>

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
              <Link href="/" onClick={() => setOpenMenu(false)}>
                Trang chủ
              </Link>
              <Link href="/products" onClick={() => setOpenMenu(false)}>
                Sản phẩm
              </Link>
              <Link href="/blog" onClick={() => setOpenMenu(false)}>
                Blog
              </Link>
              <Link href="/promotions" onClick={() => setOpenMenu(false)}>
                Khuyến mãi
              </Link>

              <div className="mt-4 border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="mb-4 flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#FF6B35]/20">
                        {user?.image && getImageUrl(user.image) ? (
                          <img
                            src={getImageUrl(user.image) || ""}
                            alt={user.accountName}
                            className="h-full w-full object-cover"
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
                      className="mb-2 flex items-center gap-2 font-medium text-[#FF6B35]"
                    >
                      <User size={17} />
                      Tài Khoản Của Tôi
                    </Link>
                    <Link
                      href="/notification"
                      onClick={() => setOpenMenu(false)}
                      className="mb-2 flex items-center gap-2 font-medium text-gray-700"
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
                      href="/profile?tab=orders"
                      onClick={() => setOpenMenu(false)}
                      className="mb-2 flex items-center gap-2 font-medium text-gray-700"
                    >
                      <ClipboardList size={17} />
                      Đơn Mua
                    </Link>
                    <Link
                      href="/profile?tab=addresses"
                      onClick={() => setOpenMenu(false)}
                      className="mb-2 flex items-center gap-2 font-medium text-gray-700"
                    >
                      <MapPin size={17} />
                      Địa Chỉ Của Tôi
                    </Link>
                    <Link
                      href="/profile?tab=vouchers"
                      onClick={() => setOpenMenu(false)}
                      className="mb-3 flex items-center gap-2 font-medium text-gray-700"
                    >
                      <Ticket size={17} />
                      Quản Lý Voucher
                    </Link>
                    <button
                      onClick={() => {
                        setOpenMenu(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-2 font-medium text-red-500"
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
                      className="mb-2 block font-medium text-[#FF6B35]"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      href="/register"
                      onClick={() => setOpenMenu(false)}
                      className="block font-medium text-[#FF6B35]"
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
