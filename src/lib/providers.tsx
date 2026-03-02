'use client';

/**
 * Client-side providers wrapper.
 * Keeps layout.tsx a Server Component while allowing React Query
 * (which requires client context) to be available app-wide.
 *
 * Adding a new provider? Compose it here — not in layout.tsx.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient once per browser session (stable across re-renders).
  // Do NOT create it outside the component — that would be shared across SSR requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds by default
            staleTime: 30_000,
            // Retry failed requests once before showing error
            retry: 1,
            // Don't refetch on window focus for user-sensitive data
            refetchOnWindowFocus: false,
          },
          mutations: {
            // Don't retry mutations by default (they may have side effects)
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show React Query Devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
