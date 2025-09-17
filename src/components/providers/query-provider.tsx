"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes
const GC_TIME = 1000 * 60 * 30; // 30 minutes

function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: STALE_TIME,
                gcTime: GC_TIME,
                refetchOnWindowFocus: false,
                refetchOnMount: "always",
                retry: (failureCount, error: any) => {
                    // Don't retry on 4xx errors except 408, 429
                    if (error?.status >= 400 && error?.status < 500) {
                        return error.status === 408 || error.status === 429;
                    }
                    return failureCount < 3;
                },
                retryDelay: (attemptIndex) =>
                    Math.min(1000 * 2 ** attemptIndex, 30000),
            },
            mutations: {
                retry: false,
            },
        },
    });
}

interface QueryProviderProps {
    children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(() => createQueryClient());

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}