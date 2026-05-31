"use client";

import { TaskProvider } from "@/context/TaskContext";
import { TimerProvider } from "@/context/TimerStateContext";
import { Toaster } from "@/components/ui/toaster";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskProvider>
        <TimerProvider>
          <ChakraProvider value={defaultSystem}>
            {children}
            <Toaster />
          </ChakraProvider>
        </TimerProvider>
      </TaskProvider>
    </QueryClientProvider>
  );
}
