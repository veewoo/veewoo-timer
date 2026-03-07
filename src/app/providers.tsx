"use client";

import { SettingsProvider } from "@/context/SettingsContext";
import { TaskProvider } from "@/context/TaskContext";
import { TimerProvider } from "@/context/TimerStateContext";
import { ChakraProvider } from "@chakra-ui/react";
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
      <SettingsProvider>
        <TaskProvider>
          <TimerProvider>
            <ChakraProvider>{children}</ChakraProvider>
          </TimerProvider>
        </TaskProvider>
      </SettingsProvider>
    </QueryClientProvider>
  );
}
