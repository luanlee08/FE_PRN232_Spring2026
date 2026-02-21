"use client";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ProfileService, ProfileResponse } from "@/services/admin_services/admin.profile.service";
import { useAuth } from "@/lib/auth/auth-context";
import { API_BASE } from "@/configs/api-configs";
import Cookies from "js-cookie";

export default function EditProfileCard() {
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [formData, setFormData] = useState({
    accountName: "",
    phoneNumber: "",
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await ProfileService.getProfile();
      if (response.status === 200 && response.data) {
        setProfile(response.data);
        setFormData({
          accountName: response.data.accountName,
          phoneNumber: response.data.phoneNumber || "",
        });
        if (response.data.image) {
          setAvatarPreview(response.data.image);
        }
      }
    } catch (error) {
      toast.error("Không thể tải thông tin profile");
    } finally {
      setLoadingProfile(false);
    }
  };

  // Helper function to get full image URL
  const getImageUrl = (imageUrl: string | null) => {
    if (!imageUrl) return null;
    // If it's a data URL (base64) or full URL, return as-is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    // Otherwise, prepend API_BASE for local backend images
    return `${API_BASE}${imageUrl}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (selectedFile) {
        await ProfileService.updateAvatar(selectedFile);
        toast.success("Cập nhật avatar thành công");
      }

      const response = await ProfileService.updateProfile(formData);
      if (response.status === 200) {
        toast.success("Cập nhật profile thành công");

        // Fetch updated profile
        const updatedProfile = await ProfileService.getProfile();
        if (updatedProfile.status === 200 && updatedProfile.data) {
          // Update cookie with new user info
          const userCookie = Cookies.get('user');
          if (userCookie) {
            const currentUser = JSON.parse(userCookie);
            const updatedUser = {
              ...currentUser,
              accountName: updatedProfile.data.accountName,
              phoneNumber: updatedProfile.data.phoneNumber,
              image: updatedProfile.data.image,
            };
            Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
          }
        }

        await fetchProfile();
        refreshUser();
        setIsEditing(false);
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error("Cập nhật profile thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-white">
            Hồ sơ cá nhân
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý thông tin cá nhân của bạn
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Chỉnh sửa
          </button>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Avatar Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-lg">
                {avatarPreview ? (
                  <img
                    src={getImageUrl(avatarPreview)!}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2.5 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h4 className="text-xl font-bold text-gray-800 dark:text-white">
                {profile?.accountName}
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile?.email}
              </p>
              <div className="mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {profile?.roleName}
                </span>
              </div>
              {isEditing && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  <svg className="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  Click vào avatar để thay đổi ảnh (Max 5MB)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Information Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-white mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Thông tin cá nhân
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên tài khoản <span className="text-red-500">*</span>
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition"
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200 py-2.5 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {profile?.accountName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <p className="text-gray-800 dark:text-gray-200 py-2.5 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {profile?.email}
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại"
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white outline-none transition"
                />
              ) : (
                <p className="text-gray-800 dark:text-gray-200 py-2.5 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  {profile?.phoneNumber || "Chưa cập nhật"}
                </p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Vai trò
              </label>
              <p className="text-gray-800 dark:text-gray-200 py-2.5 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                {profile?.roleName}
              </p>
            </div>

            {/* Created Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ngày tạo tài khoản
              </label>
              <p className="text-gray-800 dark:text-gray-200 py-2.5 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg inline-flex items-center gap-2" suppressHydrationWarning>
                <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {profile?.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : ""}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    accountName: profile?.accountName || "",
                    phoneNumber: profile?.phoneNumber || "",
                  });
                  setAvatarPreview(profile?.image || null);
                  setSelectedFile(null);
                }}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang lưu...
                  </span>
                ) : (
                  "Lưu thay đổi"
                )}
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
