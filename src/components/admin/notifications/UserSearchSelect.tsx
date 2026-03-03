"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, User, Loader2 } from "lucide-react";
import {
  AdminNotificationService,
  AccountSearchResultDto,
} from "@/services/admin_services/admin.notification.service";

interface UserSearchSelectProps {
  selectedUsers: AccountSearchResultDto[];
  onChange: (users: AccountSearchResultDto[]) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
  selectedUsers,
  onChange,
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AccountSearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Search users when query changes — selectedUsers is intentionally NOT a dep
  // because filtering happens in the render phase to avoid re-searching on every selection
  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      try {
        const res = await AdminNotificationService.searchUsers(debouncedQuery, 10);
        if (res.status === 200 && res.data) {
          setResults(res.data); // store full results; filtering is done at render time
          setIsOpen(true);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]); // only debouncedQuery — no selectedUsers

  const handleSelect = (user: AccountSearchResultDto) => {
    if (!selectedUsers.find((u) => u.accountId === user.accountId)) {
      onChange([...selectedUsers, user]);
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const handleRemove = (userId: number) => {
    onChange(selectedUsers.filter((u) => u.accountId !== userId));
  };

  return (
    <div className="space-y-2">
      {/* Selected user chips */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedUsers.map((user) => (
            <span
              key={user.accountId}
              className="inline-flex items-center gap-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700 text-xs font-medium px-2.5 py-1 rounded-full"
            >
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.accountName}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
              <span className="max-w-[120px] truncate">{user.accountName}</span>
              <button
                type="button"
                onClick={() => handleRemove(user.accountId)}
                className="ml-0.5 text-brand-500 hover:text-red-500 transition"
                aria-label={`Xóa ${user.accountName}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div ref={containerRef} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tên, email hoặc số điện thoại..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 pl-9 pr-9 py-2.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-300 dark:focus:border-brand-800 transition"
          />
        </div>

        {/* Dropdown results — filter out already-selected users at render time */}
        {isOpen && results.filter((r) => !selectedUsers.some((u) => u.accountId === r.accountId)).length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.filter((r) => !selectedUsers.some((u) => u.accountId === r.accountId)).map((user) => (
              <button
                key={user.accountId}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition"
              >
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.accountName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.accountName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                    {user.phoneNumber ? ` · ${user.phoneNumber}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-400">#{user.accountId}</span>
              </button>
            ))}
          </div>
        )}

        {isOpen && !isLoading && results.filter((r) => !selectedUsers.some((u) => u.accountId === r.accountId)).length === 0 && query.length >= 1 && (
          <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            Không tìm thấy người dùng phù hợp.
          </div>
        )}
      </div>

      {selectedUsers.length > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Đã chọn <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedUsers.length}</span> người dùng
        </p>
      )}
    </div>
  );
};

export default UserSearchSelect;
