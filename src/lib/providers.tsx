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
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useState } from 'react';

const GOOGLE_CLIENT_ID = '999395574521-h9smm3s0efmst08iumlqm01rirgkest5.apps.googleusercontent.com';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
